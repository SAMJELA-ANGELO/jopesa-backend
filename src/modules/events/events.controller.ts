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
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  RegisterEventDto,
} from './dto/event.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new event',
    description: 'Create a new event for a specific batch',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or batch not found',
  })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description: 'Retrieve paginated list of all events with optional filtering',
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
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by event status (PUBLISHED, DRAFT, CANCELLED, COMPLETED)',
  })
  @ApiQuery({
    name: 'batchId',
    required: false,
    type: String,
    description: 'Filter by batch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of events',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('batchId') batchId?: string,
  ) {
    return this.eventService.findAll(skip, take, status, batchId);
  }

  @Get('upcoming')
  @ApiOperation({
    summary: 'Get upcoming events',
    description: 'Retrieve list of upcoming published events',
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
  @ApiResponse({
    status: 200,
    description: 'List of upcoming events',
  })
  async getUpcoming(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.eventService.getUpcomingEvents(skip, take);
  }

  @Get(':id/registration/me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check if current alumni is registered for an event',
  })
  @ApiParam({ name: 'id', type: String })
  async getMyRegistration(@Param('id') id: string, @Request() req: any) {
    return this.eventService.getMyRegistration(id, req.user.id);
  }

  @Post(':id/register')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register current alumni for an event with custom form responses',
  })
  @ApiParam({ name: 'id', type: String })
  async register(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: RegisterEventDto,
  ) {
    return this.eventService.registerForEvent(id, req.user.id, body.responses || {});
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Retrieve event details with attendee information',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the event',
  })
  @ApiResponse({
    status: 200,
    description: 'Event found',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async findById(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update event',
    description: 'Update event information',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the event',
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete event',
    description: 'Delete an event',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the event',
  })
  @ApiResponse({
    status: 204,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async delete(@Param('id') id: string) {
    return this.eventService.delete(id);
  }

  @Post(':eventId/attendees/:alumniId')
  @ApiOperation({
    summary: 'Add attendee to event',
    description: 'Add an alumni as attendee to an event',
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'ID of the event',
  })
  @ApiParam({
    name: 'alumniId',
    type: String,
    description: 'ID of the alumni',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendee added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Event or alumni not found',
  })
  async addAttendee(
    @Param('eventId') eventId: string,
    @Param('alumniId') alumniId: string,
  ) {
    return this.eventService.addAttendee(eventId, alumniId);
  }

  @Delete(':eventId/attendees/:alumniId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove attendee from event',
    description: 'Remove an alumni from event attendees',
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'ID of the event',
  })
  @ApiParam({
    name: 'alumniId',
    type: String,
    description: 'ID of the alumni',
  })
  @ApiResponse({
    status: 204,
    description: 'Attendee removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Event or alumni not found',
  })
  async removeAttendee(
    @Param('eventId') eventId: string,
    @Param('alumniId') alumniId: string,
  ) {
    return this.eventService.removeAttendee(eventId, alumniId);
  }
}
