import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InitiateContributionPaymentDto } from './dto/initiate-contribution-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService, private readonly paymentsService: PaymentsService) {}

  private normalizeInstallments(installments?: any[]) {
    if (!Array.isArray(installments)) return [];

    return installments.map((installment, index) => {
      const nextItem = { ...installment };
      const label = String(nextItem?.label ?? '').trim();
      nextItem.label = label || `Installment ${index + 1}`;
      return nextItem;
    });
  }

  async findAll() {
    return this.prisma.contribution.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id },
      include: { payments: true, event: true },
    });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return contribution;
  }

  async create(createContributionDto: CreateContributionDto) {
    const { title, type, description, installments, status, eventId } = createContributionDto;

    const normalizedInstallments = this.normalizeInstallments(installments as any);

    return this.prisma.contribution.create({
      data: {
        title,
        type,
        description,
        status,
        eventId: eventId || undefined,
        installments: normalizedInstallments as any,
      },
    });
  }

  async update(id: string, updateContributionDto: UpdateContributionDto) {
    await this.findOne(id);
    const updateData: any = { ...updateContributionDto };
    if (updateContributionDto.installments) {
      updateData.installments = this.normalizeInstallments(updateContributionDto.installments as any) as any;
    }
    if (updateContributionDto.eventId !== undefined) {
      updateData.eventId = updateContributionDto.eventId || null;
    }
    delete updateData.id;
    return this.prisma.contribution.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contribution.delete({ where: { id } });
    return { success: true };
  }

  async getPayments(contributionId: string) {
    const contribution = await this.findOne(contributionId);
    const payments = await this.prisma.contributionPayment.findMany({
      where: { contributionId },
      orderBy: { createdAt: 'desc' },
    });
    return payments;
  }

  async createPayment(contributionId: string, createPaymentDto: CreatePaymentDto, payerId: string) {
    const contribution = await this.findOne(contributionId);
    const installment = ((contribution as any).installments || []).find((inst: any) => inst.id === createPaymentDto.installmentId);

    const user = await this.prisma.user.findUnique({ where: { id: payerId } });
    if (!user) {
      throw new NotFoundException('Payer not found');
    }

    return this.prisma.contributionPayment.create({
      data: {
        contributionId,
        payerId,
        payerName: `${user.firstName} ${user.lastName}`,
        payerEmail: user.email,
        amount: createPaymentDto.amount,
        installmentLabel: installment?.label,
        paymentDate: new Date(),
        status: 'COMPLETED',
        paymentReference: createPaymentDto.paymentReference,
        notes: createPaymentDto.notes,
      } as any,
    });
  }

  async initiatePayment(contributionId: string, initiatePaymentDto: InitiateContributionPaymentDto, payerId: string) {
    const contribution = await this.findOne(contributionId);
    const installment = ((contribution as any).installments || []).find((inst: any) => inst.id === initiatePaymentDto.installmentId);

    if (!installment) {
      throw new BadRequestException('Selected installment not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payerId } });
    if (!user) {
      throw new NotFoundException('Payer not found');
    }

    const amount = Number(installment.amount ?? 0);
    if (!amount || amount <= 0) {
      throw new NotFoundException('Invalid payment amount');
    }

    const reason = initiatePaymentDto.message || `Payment for ${contribution.title}`;
    const safeContributionToken = String(contributionId).replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24);
    const safeInstallmentToken = String(initiatePaymentDto.installmentId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    const externalId = `contribution-${safeContributionToken}-${safeInstallmentToken}`.slice(0, 64);

    const paymentPayload: any = {
      amount,
      currency: initiatePaymentDto.currency || 'XAF',
      userId: payerId,
      email: user.email,
      phone: initiatePaymentDto.phone || user.phone || undefined,
      externalId,
      redirectUrl: initiatePaymentDto.redirectUrl,
      reason,
      metadata: {
        contributionId,
        installmentId: initiatePaymentDto.installmentId,
        contributionTitle: contribution.title,
      },
    };

    const fapshiResponse = await this.paymentsService.directPay(paymentPayload);
    const transId = fapshiResponse?.transId || fapshiResponse?.data?.transId || null;

    const paymentData: any = {
      contributionId,
      payerId,
      payerName: `${user.firstName} ${user.lastName}`,
      payerEmail: user.email,
      amount,
      installmentLabel: installment?.label,
      status: 'PENDING',
      paymentDate: new Date(),
      paymentReference: transId,
      notes: reason,
    };

    if (transId) {
      const payment = await this.prisma.payment.findUnique({ where: { transId } });
      if (payment?.id) {
        paymentData.paymentId = payment.id;
      }
    }

    await this.prisma.contributionPayment.create({ data: paymentData as any });
    return fapshiResponse;
  }

  async findOnePayment(contributionId: string, paymentId: string) {
    const payment = await this.prisma.contributionPayment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.contributionId !== contributionId) {
      throw new NotFoundException('Contribution payment not found');
    }
    return payment;
  }

  async updatePaymentStatus(contributionId: string, paymentId: string, updateStatusDto: UpdatePaymentStatusDto) {
    const payment = await this.findOnePayment(contributionId, paymentId);
    return this.prisma.contributionPayment.update({
      where: { id: payment.id },
      data: { status: updateStatusDto.status } as any,
    });
  }

  async statsForContribution(id: string) {
    const payments = await this.prisma.contributionPayment.findMany({ where: { contributionId: id } });
    const total = payments.reduce((sum, p: any) => sum + p.amount, 0);
    const count = payments.length;
    return { total, count };
  }
}
