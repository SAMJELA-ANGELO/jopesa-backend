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
import { AlumniService } from './alumni.service';
import { CreateAlumniDto, UpdateAlumniProfileDto, AlumniResponseDto } from './dto/alumni.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@ApiTags('alumni')
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new alumni',
    description: 'Create a new alumni account with user and profile information',
  })
  @ApiResponse({
    status: 201,
    description: 'Alumni created successfully',
    type: AlumniResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data provided',
  })
  async create(@Body() createAlumniDto: CreateAlumniDto) {
    return this.alumniService.createAlumni(createAlumniDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all alumni',
    description: 'Retrieve paginated list of all alumni with optional filtering',
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
    name: 'batch',
    required: false,
    type: String,
    description: 'Filter by batch ID',
  })
  @ApiQuery({
    name: 'branch',
    required: false,
    type: String,
    description: 'Filter by branch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of alumni returned successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('batch') batch?: string,
    @Query('branch') branch?: string,
  ) {
    return this.alumniService.findAll(skip, take, batch, branch);
  }

  @Get('members')
  @ApiOperation({
    summary: 'Get public alumni directory',
    description: 'Retrieve alumni entries for the alumni directory page with public profile data and computed membership status',
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
    name: 'batch',
    required: false,
    type: String,
    description: 'Filter by batch ID',
  })
  @ApiQuery({
    name: 'branch',
    required: false,
    type: String,
    description: 'Filter by branch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Directory list returned successfully',
  })
  async getDirectoryMembers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('batch') batch?: string,
    @Query('branch') branch?: string,
  ) {
    return this.alumniService.getDirectoryMembers(Number(skip ?? 0), Number(take ?? 100), batch, branch);
  }

  @Get('members/:id')
  @ApiOperation({
    summary: 'Get public alumni detail',
    description: 'Retrieve a public alumni detail record for the directory profile modal or detail page',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the alumni profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Public alumni detail returned successfully',
  })
  async getPublicMemberById(@Param('id') id: string) {
    return this.alumniService.getPublicMemberById(id);
  }

  @Get('email/:email')
  @ApiOperation({
    summary: 'Get alumni by email',
    description: 'Retrieve alumni profile by email address',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: 'Email address of the alumni',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni profile found',
    type: AlumniResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni not found',
  })
  async findByEmail(@Param('email') email: string) {
    return this.alumniService.findByEmail(email);
  }

  @Get('batch/:batchId')
  @ApiOperation({
    summary: 'Get alumni by batch',
    description: 'Retrieve all alumni from a specific batch',
  })
  @ApiParam({
    name: 'batchId',
    type: String,
    description: 'ID of the batch',
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
    description: 'Alumni list for the batch',
  })
  async getByBatch(
    @Param('batchId') batchId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.alumniService.getAlumniByBatch(batchId, skip, take);
  }

  @Get('branch/:branchId')
  @ApiOperation({
    summary: 'Get alumni by branch',
    description: 'Retrieve all alumni from a specific branch',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'ID of the branch',
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
    description: 'Alumni list for the branch',
  })
  async getByBranch(
    @Param('branchId') branchId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.alumniService.getAlumniByBranch(branchId, skip, take);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current alumni profile',
    description: 'Retrieve the authenticated alumni profile',
  })
  async getMe(@Request() req: any) {
    return this.alumniService.findByUserId(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current alumni profile',
    description: 'Update the authenticated alumni profile and user details',
  })
  async updateMe(@Request() req: any, @Body() body: UpdateAlumniProfileDto) {
    return this.alumniService.updateMyProfile(req.user.id, body);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get alumni by ID',
    description: 'Retrieve alumni profile by their ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the alumni',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni profile found',
    type: AlumniResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni not found',
  })
  async findById(@Param('id') id: string) {
    return this.alumniService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update alumni profile',
    description: 'Update alumni profile information',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the alumni',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni profile updated successfully',
    type: AlumniResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAlumniProfileDto: UpdateAlumniProfileDto,
  ) {
    return this.alumniService.updateProfile(id, updateAlumniProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete alumni profile',
    description: 'Delete an alumni profile and associated user account',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the alumni',
  })
  @ApiResponse({
    status: 204,
    description: 'Alumni profile deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni not found',
  })
  async delete(@Param('id') id: string) {
    return this.alumniService.deleteAlumni(id);
  }
}
