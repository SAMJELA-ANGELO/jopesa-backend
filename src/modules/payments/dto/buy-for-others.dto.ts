import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BuyForOthersDto {
  @IsNumber()
  amount: number;

  @IsString()
  recipient: string; // recipient identifier (email or user id)

  @IsOptional()
  @IsString()
  purchaserName?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;
}
