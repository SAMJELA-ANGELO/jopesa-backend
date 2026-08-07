import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  @IsNotEmpty()
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}
