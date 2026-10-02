import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class InitiateContributionPaymentDto {
  @IsOptional()
  @IsString()
  installmentId?: string;

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
  @Matches(/^6\d{8}$/, { message: 'Phone number must be 9 digits and start with 6' })
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
