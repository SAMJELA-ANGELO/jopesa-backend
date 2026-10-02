import { IsInt, IsOptional, IsString, IsNotEmpty, Matches, Min } from 'class-validator';

export class DirectPayDto {
  @IsInt()
  @Min(100)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^6\d{8}$/, { message: 'Phone number must be 9 digits and start with 6' })
  phone: string;

  @IsOptional()
  @IsString()
  medium?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
