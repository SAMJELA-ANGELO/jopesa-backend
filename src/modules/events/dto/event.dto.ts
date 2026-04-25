import { IsString, IsDateString, IsOptional, IsBoolean, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
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

  @ApiProperty({ example: '2025-05-15T18:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-05-15T21:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Amman, Jordan' })
  @IsString()
  location: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  batchId: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsUrl()
  meetLink?: string;
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

  @ApiPropertyOptional({ enum: EventStatus, example: 'PUBLISHED' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;
}

export class EventResponseDto {
  id: string;
  title: string;
  description: string;
  image?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  batchId: string;
  status: string;
  isVirtual: boolean;
  meetLink?: string;
  createdAt: Date;
  updatedAt: Date;
}
