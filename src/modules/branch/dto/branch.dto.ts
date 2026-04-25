import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CS' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Department of Computer Science' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Computer Science Engineering' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'CSE' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class BranchResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
