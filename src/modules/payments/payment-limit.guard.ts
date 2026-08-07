import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const amount = req.body?.amount ?? 0;
    const limit = Number(process.env.PAYMENT_LIMIT || '10000000');
    return Number(amount) <= limit;
  }
}
