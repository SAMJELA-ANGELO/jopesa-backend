import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export type ContributionType =
  | 'EVENT_REGISTRATION'
  | 'ANNUAL_FEE'
  | 'GENERAL'
  | 'PROJECT'
  | 'OTHER';

export type ContributionStatus = 'ACTIVE' | 'INACTIVE';

export class InstallmentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  dueDate?: string;
}

export class CreateContributionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(['EVENT_REGISTRATION', 'ANNUAL_FEE', 'GENERAL', 'PROJECT', 'OTHER'])
  type: ContributionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstallmentDto)
  installments: InstallmentDto[];

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: ContributionStatus;
}
