import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { DirectPayDto } from './dto/direct-pay.dto';
import { BuyForOthersDto } from './dto/buy-for-others.dto';
import axios from 'axios';
import * as crypto from 'crypto';

const FAPSHI_BASE = process.env.FAPSHI_BASE_URL || 'https://live.fapshi.com';
const FAPSHI_APIUSER = process.env.FAPSHI_USER;
const FAPSHI_APIKEY = process.env.FAPSHI_API_KEY;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private headers() {
    const h: Record<string, string> = {};
    if (FAPSHI_APIUSER) h['apiuser'] = FAPSHI_APIUSER;
    if (FAPSHI_APIKEY) h['apikey'] = FAPSHI_APIKEY;
    return h;
  }

  async initiatePayment(dto: InitiatePaymentDto) {
    const url = `${FAPSHI_BASE}/initiate-pay`;
    const payload = {
      amount: dto.amount,
      email: dto['email'],
      userId: dto['userId'],
      externalId: dto['externalId'],
      redirectUrl: dto['redirectUrl'],
      phone: dto['phone'] || undefined,
      message: dto['reason'] || dto['message'] || 'Payment',
    };

    let resp;
    try {
      resp = await axios.post(url, payload, { headers: this.headers() });
    } catch (error) {
      const responseMessage = (error as any)?.response?.data?.message;
      const message = Array.isArray(responseMessage) ? responseMessage.join(', ') : responseMessage;
      throw new BadRequestException(message || 'Payment provider rejected the transaction');
    }
    // Persist a Payment record if transId returned
    const data = resp.data || {};
    try {
      await this.prisma.payment.create({
        data: {
          transId: data.transId || data.data?.transId || null,
          amount: Number(dto.amount),
          currency: dto['currency'] ? String(dto['currency']) : 'XAF',
          status: 'CREATED',
          userId: dto['userId'] || undefined,
          email: dto['email'] || undefined,
          externalId: dto['externalId'] || undefined,
          reason: payload.message,
          metadata: dto['metadata'] || undefined,
          rawPayload: data,
        },
      });
    } catch (e) {
      this.logger.warn('Failed to persist payment record: ' + (e as any).message);
    }

    return data;
  }

  // Wrapper for paymentStatus
  async paymentStatus(transId: string) {
    const url = `${FAPSHI_BASE}/payment-status/${transId}`;
    const resp = await axios.get(url, { headers: this.headers() });
    return resp.data;
  }

  // Minimal buyForOthers delegated to initiatePayment
  async buyForOthers(dto: BuyForOthersDto) {
    const initiateDto: any = {
      amount: dto.amount,
      userId: dto.recipient,
      reason: dto.reason || 'Buy for others',
      redirectUrl: dto.redirectUrl,
      currency: dto.currency,
      email: undefined,
    };
    return this.initiatePayment(initiateDto);
  }

  // Handle webhook: verify by checking signature or querying Fapshi paymentStatus
  async handleWebhook(payload: any, headers: Record<string, string | undefined>) {
    // Try signature verification if provided
    const signature = headers['x-fapshi-signature'] || headers['x-fapshi_sig'];
    if (signature && FAPSHI_APIKEY) {
      const computed = crypto.createHmac('sha256', FAPSHI_APIKEY).update(JSON.stringify(payload)).digest('hex');
      if (computed !== signature) {
        this.logger.warn('Invalid webhook signature');
        return { ok: false };
      }
    }

    // If apiuser/apikey headers exist on webhook, confirm they match ours
    if (headers['apiuser'] || headers['apikey']) {
      if (headers['apiuser'] !== FAPSHI_APIUSER || headers['apikey'] !== FAPSHI_APIKEY) {
        this.logger.warn('Webhook api credentials do not match configured values');
        return { ok: false };
      }
    }

    // If payload contains transId, verify with Fapshi API and persist
    const transId = payload?.transId || payload?.data?.transId || payload?.trans_id || payload?.transactionId;
    if (!transId) {
      this.logger.warn('Webhook missing transId');
      return { ok: false };
    }

    const event = await this.paymentStatus(transId);
    if (!event || event.statusCode !== 200) {
      this.logger.warn('Failed to verify event with Fapshi');
      return { ok: false };
    }

    // Map status to our PaymentStatus enum values
    const statusMap: Record<string, string> = {
      SUCCESSFUL: 'SUCCESSFUL',
      SUCCESS: 'SUCCESSFUL',
      FAILED: 'FAILED',
      EXPIRED: 'EXPIRED',
      CREATED: 'CREATED',
    };

    const status = statusMap[event.status] || statusMap[event.data?.status] || 'CREATED';

    try {
      const payment = await this.prisma.payment.upsert({
        where: { transId: transId },
        update: {
          status: status as any,
          rawPayload: event,
        },
        create: {
          transId: transId,
          amount: Number(event.amount || event.data?.amount || 0),
          currency: String(event.currency || event.data?.currency || 'XAF'),
          status: status as any,
          externalId: event.externalId || event.data?.externalId || undefined,
          rawPayload: event,
        },
      });

      if (payment?.id) {
        await this.prisma.contributionPayment.updateMany({
          where: {
            payment: {
              transId: transId,
            },
          },
          data: {
            status: status === 'SUCCESSFUL' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : 'PENDING',
          },
        });
      }
    } catch (e) {
      this.logger.error('Failed to upsert payment: ' + (e as any).message);
    }

    return { ok: true };
  }

  // Additional SDK-like helpers
  async directPay(dto: DirectPayDto) {
    const url = `${FAPSHI_BASE}/direct-pay`;
    const payload = {
      amount: dto.amount,
      phone: dto.phone || undefined,
      externalId: dto.externalId || undefined,
      userId: dto.userId || undefined,
      email: dto.email || undefined,
      name: dto.name || undefined,
      medium: dto.medium || undefined,
      message: dto.message || 'Payment',
    };

    const resp = await axios.post(url, payload, { headers: this.headers() });
    const data = resp.data || {};

    try {
      await this.prisma.payment.create({
        data: {
          transId: data.transId || data.data?.transId || null,
          amount: Number(dto.amount),
          currency: (dto as any)['currency'] ? String((dto as any)['currency']) : 'XAF',
          status: 'CREATED',
          userId: dto.userId || undefined,
          email: dto.email || undefined,
          externalId: dto.externalId || undefined,
          reason: payload.message,
          metadata: (dto as any)['metadata'] || undefined,
          rawPayload: data,
        },
      });
    } catch (e) {
      this.logger.warn('Failed to persist payment record via direct pay: ' + (e as any).message);
    }

    return data;
  }

  async payout(data: any) {
    const url = `${FAPSHI_BASE}/payout`;
    const resp = await axios.post(url, data, { headers: this.headers() });
    return resp.data;
  }

  async expirePay(transId: string) {
    const url = `${FAPSHI_BASE}/expire-pay`;
    const resp = await axios.post(url, { transId }, { headers: this.headers() });
    return resp.data;
  }

  async userTrans(userId: string) {
    const url = `${FAPSHI_BASE}/transaction/${userId}`;
    const resp = await axios.get(url, { headers: this.headers() });
    return resp.data;
  }

  async balance() {
    const url = `${FAPSHI_BASE}/balance`;
    const resp = await axios.get(url, { headers: this.headers() });
    return resp.data;
  }

  async search(params = {}) {
    const url = `${FAPSHI_BASE}/search`;
    const resp = await axios.get(url, { headers: this.headers(), params });
    return resp.data;
  }
}
