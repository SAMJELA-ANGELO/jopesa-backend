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
import { BranchService } from './branch.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
} from './dto/branch.dto';

@ApiTags('branch')
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new branch',
    description: 'Create a new academic branch/department',
  })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Branch with this name or code already exists',
  })
  async create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all branches',
    description: 'Retrieve paginated list of all branches',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of items to take',
  })
  @ApiResponse({
    status: 200,
    description: 'Branches retrieved successfully',
  })
  async findAll(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.branchService.findAll(parseInt(skip), parseInt(take));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get branch by ID',
    description: 'Retrieve a specific branch with alumni count',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Branch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch retrieved successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  async findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Get branch by code',
    description: 'Retrieve a specific branch by its code',
  })
  @ApiParam({
    name: 'code',
    type: String,
    description: 'Branch code (e.g., CS, CE)',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch retrieved successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  async findByCode(@Param('code') code: string) {
    return this.branchService.findByCode(code);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a branch',
    description: 'Update branch details',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Branch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch updated successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Branch with this name or code already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a branch',
    description: 'Delete a branch by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Branch ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Branch deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  async delete(@Param('id') id: string) {
    await this.branchService.delete(id);
  }
}
