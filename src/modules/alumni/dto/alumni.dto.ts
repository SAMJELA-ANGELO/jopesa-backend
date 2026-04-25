import { IsEmail, IsString, IsOptional, IsPhoneNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlumniDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+962790000000' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  batchId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  branchId: string;
}

export class UpdateAlumniProfileDto {
  @ApiPropertyOptional({ example: 'Updated bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsUrl()
  linkedIn?: string;

  @ApiPropertyOptional({ example: '@johndoe' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ example: '@johndoe' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://johndoe.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Senior Engineer' })
  @IsOptional()
  @IsString()
  currentRole?: string;

  @ApiPropertyOptional({ example: 'Tech Company' })
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional({ example: 'Amman, Jordan' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class AlumniResponseDto {
  id: string;
  userId: string;
  batchId: string;
  branchId: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  linkedIn?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  currentRole?: string;
  currentCompany?: string;
  location?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
