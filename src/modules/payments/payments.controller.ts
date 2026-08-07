import { Body, Controller, Post, Headers, HttpCode, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { DefaultAdminGuard } from 'src/modules/auth/guards/default-admin.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { BuyForOthersDto } from './dto/buy-for-others.dto';
import { WebhookDto } from './dto/webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtGuard, RolesGuard, DefaultAdminGuard)
  @Roles(UserRole.ADMIN)
  @Post('initiate')
  async initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(dto);
  }

  @UseGuards(JwtGuard, RolesGuard, DefaultAdminGuard)
  @Roles(UserRole.ADMIN)
  @Post('buy-for-others')
  async buyForOthers(@Body() dto: BuyForOthersDto) {
    return this.paymentsService.buyForOthers(dto);
  }

  // Fapshi webhook endpoint
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() payload: WebhookDto, @Headers() headers: Record<string, string | string[]>) {
    // Normalize headers to string map
    const normalized: Record<string, string> = {};
    for (const k of Object.keys(headers || {})) {
      const v = headers[k];
      if (Array.isArray(v)) normalized[k.toLowerCase()] = v[0];
      else if (typeof v === 'string') normalized[k.toLowerCase()] = v;
    }
    return this.paymentsService.handleWebhook(payload, normalized);
  }
}
