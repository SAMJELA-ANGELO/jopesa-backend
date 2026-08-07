import { Test } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';

jest.mock('axios');

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PaymentsService, PrismaService],
    }).compile();

    service = module.get(PaymentsService);
    prisma = module.get(PrismaService);

    // mock prisma.payment
    prisma.payment = {
      create: jest.fn().mockResolvedValue(true),
      upsert: jest.fn().mockResolvedValue(true),
    } as any;
  });

  afterEach(() => jest.resetAllMocks());

  it('should call initiate-pay and persist payment', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { transId: 'ABC123' } });
    const dto: any = { amount: 500, userId: 'u1' };
    const res = await service.initiatePayment(dto);
    expect(res.transId).toBe('ABC123');
    expect(prisma.payment.create).toHaveBeenCalled();
  });

  it('should verify webhook by calling paymentStatus and upsert', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { statusCode: 200, status: 'SUCCESSFUL', amount: 500 } });
    const payload = { transId: 'ABC123' };
    const headers = {} as any;
    const res = await service.handleWebhook(payload, headers);
    expect(res.ok).toBe(true);
    expect(prisma.payment.upsert).toHaveBeenCalled();
  });
});
