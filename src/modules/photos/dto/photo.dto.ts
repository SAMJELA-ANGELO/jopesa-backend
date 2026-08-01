import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventPhotoDto {
  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'folder/public-id' })
  @IsOptional()
  @IsString()
  publicId?: string;

  @ApiPropertyOptional({ example: 'Opening ceremony' })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateEventPhotosBulkDto {
  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  eventId: string;

  @ApiProperty({
    example: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  urls: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  publicIds?: string[];
}

export class EventPhotoResponseDto {
  id: string;
  eventId: string;
  url: string;
  publicId?: string;
  caption?: string;
  createdAt: Date;
  event?: {
    id: string;
    title: string;
  };
}
