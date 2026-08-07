import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitiateContributionPaymentDto {
  @IsString()
  @IsNotEmpty()
  installmentId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
