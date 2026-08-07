import { Module } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { ContributionPaymentsController } from './contributions-payments.controller';
import { ContributionsAdminController } from './admin.controller';
import { PrismaService } from 'src/prisma.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  providers: [ContributionsService, PrismaService],
  controllers: [ContributionsController, ContributionPaymentsController, ContributionsAdminController],
  exports: [ContributionsService],
})
export class ContributionsModule {}
