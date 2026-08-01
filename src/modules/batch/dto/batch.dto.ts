import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ example: 2020 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 'Batch 2020' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Spring' })
  @IsOptional()
  @IsString()
  season?: string;
}

export class UpdateBatchDto {
  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'Batch 2020 Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Fall' })
  @IsOptional()
  @IsString()
  season?: string;
}

export class BatchResponseDto {
  id: string;
  year: number;
  name: string;
  season?: string;
  createdAt: Date;
  updatedAt: Date;
}
