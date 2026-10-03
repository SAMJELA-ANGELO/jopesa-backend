import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InstallmentDto } from './create-contribution.dto';

export type ContributionType =
  | 'EVENT_REGISTRATION'
  | 'REGISTRATION_FEE'
  | 'ANNUAL_FEE'
  | 'GENERAL'
  | 'DONATION'
  | 'PROJECT'
  | 'OTHER';

export type ContributionStatus = 'ACTIVE' | 'INACTIVE';

export class UpdateContributionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(['EVENT_REGISTRATION', 'REGISTRATION_FEE', 'ANNUAL_FEE', 'GENERAL', 'DONATION', 'PROJECT', 'OTHER'])
  @IsOptional()
  type?: ContributionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstallmentDto)
  @IsOptional()
  installments?: InstallmentDto[];

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: ContributionStatus;
}
