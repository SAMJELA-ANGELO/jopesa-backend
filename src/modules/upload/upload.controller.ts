import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES_PER_REQUEST,
} from './upload.constants';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_FILE_SIZE_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a single image',
    description: 'Upload an image to Cloudinary',
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    type: String,
    description: 'Optional folder path',
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      properties: {
        url: { type: 'string' },
        publicId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No file provided or upload failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadImage(
    @UploadedFile() file: any,
    @Query('folder') folder: string = 'posts',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File must be an image or video');
    }

    return this.uploadService.uploadFile(file, folder);
  }

  @Post('images')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', MAX_UPLOAD_FILES_PER_REQUEST, { limits: { fileSize: MAX_UPLOAD_FILE_SIZE_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload multiple images',
    description: 'Upload multiple images to Cloudinary',
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    type: String,
    description: 'Optional folder path',
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          url: { type: 'string' },
          publicId: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No files provided or upload failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadImages(
    @UploadedFiles() files: any[],
    @Query('folder') folder: string = 'posts',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate file types
    for (const file of files) {
      if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
        throw new BadRequestException('All files must be images or videos');
      }
    }

    return this.uploadService.uploadMultipleFiles(files, folder);
  }

  @Post('document')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_FILE_SIZE_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a document',
    description: 'Upload a document file (PDF, Word, etc.)',
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    type: String,
    description: 'Optional folder path',
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      properties: {
        url: { type: 'string' },
        publicId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No file provided or upload failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadDocument(
    @UploadedFile() file: any,
    @Query('folder') folder: string = 'documents',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadService.uploadFile(file, folder);
  }
}
