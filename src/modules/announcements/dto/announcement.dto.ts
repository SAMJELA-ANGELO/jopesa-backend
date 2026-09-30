import { IsString, IsOptional, IsUrl, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnnouncementType {
  NEWS = 'NEWS',
  UPDATE = 'UPDATE',
  EVENT = 'EVENT',
  OPPORTUNITY = 'OPPORTUNITY',
  WARNING = 'WARNING',
}

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Important Update' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is an important announcement for all alumni' })
  @IsString()
  content: string;

  @ApiProperty({ enum: AnnouncementType, example: 'NEWS' })
  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class AnnouncementResponseDto {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  image?: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
