import { IsString, IsDateString, IsOptional, IsBoolean, IsUrl, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum FormFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  TEXTAREA = 'textarea',
  FILE = 'file',
  DATE = 'date',
}

export class FormFieldOption {
  @ApiProperty({ example: 'Option 1' })
  label: string;

  @ApiProperty({ example: 'option1' })
  value: string;
}

export class FormField {
  @ApiProperty({ example: 'fullName' })
  id: string;

  @ApiProperty({ example: 'Full Name' })
  label: string;

  @ApiProperty({ enum: FormFieldType, example: FormFieldType.TEXT })
  type: FormFieldType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ example: 'Enter your full name' })
  @IsOptional()
  placeholder?: string;

  @ApiPropertyOptional({ type: [FormFieldOption], example: [{ label: 'Option 1', value: 'option1' }] })
  @IsOptional()
  @IsArray()
  options?: FormFieldOption[];

  @ApiPropertyOptional({ example: 'min: 3, max: 50' })
  @IsOptional()
  validation?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Alumni Meetup 2025' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Join us for an exciting meetup with alumni from batch 2020' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/event.jpg' })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: ['https://example.com/event.jpg', 'https://example.com/event-2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsUrl(undefined, { each: true })
  images?: string[];

  @ApiProperty({ example: '2025-05-15T18:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-05-15T21:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Amman, Jordan' })
  @IsString()
  location: string;

  @ApiProperty({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] })
  @IsArray()
  @IsString({ each: true })
  batchIds: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsUrl()
  meetLink?: string;

  @ApiPropertyOptional({ enum: EventStatus, example: EventStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'reunion' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ type: [FormField], example: [{ id: 'fullName', label: 'Full Name', type: 'text', required: true }] })
  @IsOptional()
  @IsArray()
  @Type(() => FormField)
  registrationForm?: FormField[];
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Alumni Meetup 2025 Updated' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/event-updated.jpg' })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: ['https://example.com/event-updated.jpg'] })
  @IsOptional()
  @IsArray()
  @IsUrl(undefined, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: '2025-05-16T18:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-05-16T21:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Updated location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  batchIds?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsUrl()
  meetLink?: string;

  @ApiPropertyOptional({ enum: EventStatus, example: 'PUBLISHED' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'reunion' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ type: [FormField], example: [{ id: 'fullName', label: 'Full Name', type: 'text', required: true }] })
  @IsOptional()
  @IsArray()
  @Type(() => FormField)
  registrationForm?: FormField[];
}

export class EventResponseDto {
  id: string;
  title: string;
  description: string;
  image?: string;
  images?: string[];
  startDate: Date;
  endDate: Date;
  location: string;
  batches: any[];
  status: string;
  isVirtual: boolean;
  meetLink?: string;
  registrationForm?: FormField[];
  createdAt: Date;
  updatedAt: Date;
}

export class RegisterEventDto {
  @ApiProperty({
    example: { fullName: 'Jane Doe', dietary: 'vegetarian' },
    description: 'Map of registration form field id to submitted value',
  })
  @IsObject()
  responses: Record<string, unknown>;
}
