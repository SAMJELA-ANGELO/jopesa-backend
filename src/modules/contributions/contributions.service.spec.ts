import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ContributionsService } from './contributions.service';

describe('ContributionsService payment amounts', () => {
  let service: ContributionsService;
  let prisma: {
    contribution: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
    payment: { findUnique: jest.Mock };
    contributionPayment: { create: jest.Mock };
  };
  let paymentsService: { directPay: jest.Mock };

  beforeEach(() => {
    prisma = {
      contribution: { findUnique: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'member-1', firstName: 'A', lastName: 'Member', email: 'member@example.com' }) },
      payment: { findUnique: jest.fn().mockResolvedValue(null) },
      contributionPayment: { create: jest.fn().mockResolvedValue({ id: 'contribution-payment-1' }) },
    };
    paymentsService = { directPay: jest.fn().mockResolvedValue({ transId: 'transaction-1' }) };
    service = new ContributionsService(prisma as unknown as PrismaService, paymentsService as any);
  });

  it('uses the member-entered amount for a donation without an installment', async () => {
    prisma.contribution.findUnique.mockResolvedValue({
      id: 'contribution-1',
      title: 'Community Donation',
      type: 'DONATION',
      installments: [],
    });

    await service.initiatePayment('contribution-1', { amount: 7500 }, 'member-1');

    expect(paymentsService.directPay).toHaveBeenCalledWith(expect.objectContaining({ amount: 7500 }));
    expect(prisma.contributionPayment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ amount: 7500, installmentLabel: 'Voluntary donation' }),
    }));
  });

  it('uses the configured installment amount for fixed contributions', async () => {
    prisma.contribution.findUnique.mockResolvedValue({
      id: 'contribution-1',
      title: 'Annual Fee',
      type: 'ANNUAL_FEE',
      installments: [{ id: 'installment-1', amount: 12000, label: 'Annual payment' }],
    });

    await service.initiatePayment('contribution-1', { installmentId: 'installment-1', amount: 1 }, 'member-1');

    expect(paymentsService.directPay).toHaveBeenCalledWith(expect.objectContaining({ amount: 12000 }));
  });

  it('rejects zero donation amounts', async () => {
    prisma.contribution.findUnique.mockResolvedValue({
      id: 'contribution-1',
      title: 'Community Donation',
      type: 'DONATION',
      installments: [],
    });

    await expect(service.initiatePayment('contribution-1', { amount: 0 }, 'member-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(paymentsService.directPay).not.toHaveBeenCalled();
  });
});
