import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Check out this great opportunity!' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated post content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class PostResponseDto {
  id: string;
  content: string;
  image?: string;
  author: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    comments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post! I agree with this.' })
  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ example: 'Updated comment content' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class CommentResponseDto {
  id: string;
  content: string;
  author: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
