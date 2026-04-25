import { IsString, IsOptional, IsUrl, IsInt, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DocumentType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  PRESENTATION = 'PRESENTATION',
  SPREADSHEET = 'SPREADSHEET',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER',
}

export class CreateDocumentDto {
  @ApiProperty({ example: 'Job Interview Guide' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Comprehensive guide for job interviews' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/document.pdf' })
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ enum: DocumentType, example: 'PDF' })
  @IsEnum(DocumentType)
  fileType: DocumentType;

  @ApiProperty({ example: 1024000 })
  @Type(() => Number)
  @IsInt()
  fileSize: number;

  @ApiProperty({ example: 'Job Resources' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: ['interview', 'job', 'guidance'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Job Resources Updated' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['updated', 'tags'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class DocumentResponseDto {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: DocumentType;
  fileSize: number;
  category: string;
  tags: string[];
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}
