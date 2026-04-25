import {
  Controller,
  Get,
  Post,
  Put,
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
import { AnnouncementService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, AnnouncementResponseDto } from './dto/announcement.dto';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new announcement',
    description: 'Create a new announcement for all alumni',
  })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
    type: AnnouncementResponseDto,
  })
  async create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.create(createAnnouncementDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all announcements',
    description: 'Retrieve paginated list of announcements, pinned first',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by announcement type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of announcements',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('type') type?: string,
  ) {
    return this.announcementService.findAll(skip, take, type);
  }

  @Get('pinned')
  @ApiOperation({
    summary: 'Get pinned announcements',
    description: 'Retrieve all pinned announcements',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pinned announcements',
  })
  async getPinned() {
    return this.announcementService.getPinned();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get announcement by ID',
    description: 'Retrieve announcement details',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the announcement',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcement found',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Announcement not found',
  })
  async findById(@Param('id') id: string) {
    return this.announcementService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update announcement',
    description: 'Update announcement information',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the announcement',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcement updated successfully',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Announcement not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete announcement',
    description: 'Delete an announcement',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the announcement',
  })
  @ApiResponse({
    status: 204,
    description: 'Announcement deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Announcement not found',
  })
  async delete(@Param('id') id: string) {
    return this.announcementService.delete(id);
  }
}
