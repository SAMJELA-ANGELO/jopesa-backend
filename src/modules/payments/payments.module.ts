import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'src/prisma.service';
import { PaymentLimitGuard } from './payment-limit.guard';
import { WebhookController } from './webhook.controller';

@Module({
  providers: [PaymentsService, PrismaService, PaymentLimitGuard],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

