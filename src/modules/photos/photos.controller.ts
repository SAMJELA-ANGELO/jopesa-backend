import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PhotoService } from './photos.service';
import {
  CreateEventPhotoDto,
  CreateEventPhotosBulkDto,
  EventPhotoResponseDto,
} from './dto/photo.dto';

@ApiTags('photos')
@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a photo record linked to an event' })
  @ApiResponse({ status: 201, type: EventPhotoResponseDto })
  async create(@Body() body: CreateEventPhotoDto) {
    return this.photoService.create(body);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple photo records for an event' })
  async createBulk(@Body() body: CreateEventPhotosBulkDto) {
    return this.photoService.createBulk(body);
  }

  @Get()
  @ApiOperation({ summary: 'List event photos' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('eventId') eventId?: string,
  ) {
    return this.photoService.findAll(
      skip ? Number(skip) : 0,
      take ? Number(take) : 100,
      eventId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get photo by ID' })
  @ApiParam({ name: 'id', type: String })
  async findById(@Param('id') id: string) {
    return this.photoService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a photo record' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string) {
    return this.photoService.delete(id);
  }
}
