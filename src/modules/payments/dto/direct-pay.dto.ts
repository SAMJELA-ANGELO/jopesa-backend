import { IsInt, IsOptional, IsString, IsNotEmpty, Length, Min } from 'class-validator';

export class DirectPayDto {
  @IsInt()
  @Min(100)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Length(9, 12)
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
