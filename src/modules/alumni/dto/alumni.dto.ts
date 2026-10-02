import { IsEmail, IsString, IsOptional, IsUrl, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

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

  @ApiPropertyOptional({ example: '+237674818818' })
  @IsOptional()
  @Matches(/^\+?[0-9][0-9\s\-()]{6,19}$/, {
    message: 'Phone number must be a valid international number',
  })
  phone?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  batchId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  branchId: string;
}

export class UpdateAlumniProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+237674818818' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @Matches(/^\+?[0-9][0-9\s\-()]{6,19}$/, {
    message: 'Phone number must be a valid international number',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ example: 'Updated bio' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Married' })
  @IsOptional()
  @IsString()
  relationshipStatus?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUrl()
  linkedIn?: string;

  @ApiPropertyOptional({ example: '@johndoe' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ example: '@johndoe' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://johndoe.com' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Senior Engineer' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  currentRole?: string;

  @ApiPropertyOptional({ example: 'Tech Company' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional({ example: 'Amman, Jordan' })
  @Transform(emptyToUndefined)
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
  relationshipStatus?: string;
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
