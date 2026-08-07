import { Test } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: { initiatePayment: jest.fn(), directPay: jest.fn(), buyForOthers: jest.fn(), handleWebhook: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(PaymentsController);
    service = module.get(PaymentsService);
  });

  it('should call initiate', async () => {
    const dto: any = { amount: 500 };
    (service.initiatePayment as jest.Mock).mockResolvedValue({ ok: true });
    const res = await controller.initiate(dto);
    expect(res.ok).toBe(true);
  });

  it('should delegate direct-pay to the service', async () => {
    const dto: any = { amount: 500, phone: '690000000', externalId: 'external-123' };
    (service.directPay as jest.Mock).mockResolvedValue({ ok: true });
    const res = await controller.directPay(dto);
    expect(service.directPay).toHaveBeenCalledWith(dto);
    expect(res.ok).toBe(true);
  });
});
