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
import { BatchService } from './batch.service';
import { CreateBatchDto, UpdateBatchDto, BatchResponseDto } from './dto/batch.dto';

@ApiTags('batch')
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new batch',
    description: 'Create a new academic batch/year',
  })
  @ApiResponse({
    status: 201,
    description: 'Batch created successfully',
    type: BatchResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Batch already exists for this year',
  })
  async create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.create(createBatchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all batches',
    description: 'Retrieve paginated list of all batches',
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
    description: 'List of batches',
  })
  async findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.batchService.findAll(skip, take);
  }

  @Get('year/:year')
  @ApiOperation({
    summary: 'Get batch by year',
    description: 'Retrieve batch information by year',
  })
  @ApiParam({
    name: 'year',
    type: Number,
    description: 'Year of the batch',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch found',
    type: BatchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async findByYear(@Param('year') year: number) {
    return this.batchService.findByYear(year);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get batch by ID',
    description: 'Retrieve batch details with alumni count',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the batch',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch found',
    type: BatchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async findById(@Param('id') id: string) {
    return this.batchService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update batch',
    description: 'Update batch information',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the batch',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch updated successfully',
    type: BatchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchService.update(id, updateBatchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete batch',
    description: 'Delete a batch',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the batch',
  })
  @ApiResponse({
    status: 204,
    description: 'Batch deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async delete(@Param('id') id: string) {
    return this.batchService.delete(id);
  }
}
