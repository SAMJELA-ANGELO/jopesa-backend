import { Body, Controller, Headers, HttpCode, Post, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller()
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(200)
  async liveWebhook(@Body() payload: any, @Headers('x-wh-secret') secret: string, @Headers() headers: Record<string, any>) {
    const configured = process.env.JOPESA_CONNECT_WEBHOOK_SECRET;
    if (configured && secret !== configured) {
      throw new ForbiddenException('Invalid webhook secret');
    }

    // Normalize headers map and pass to service for verification & processing
    const normalized: Record<string, string> = {};
    for (const k of Object.keys(headers || {})) {
      const v = headers[k];
      if (Array.isArray(v)) normalized[k.toLowerCase()] = v[0];
      else if (typeof v === 'string') normalized[k.toLowerCase()] = v;
    }

    return this.paymentsService.handleWebhook(payload, normalized);
  }
}
