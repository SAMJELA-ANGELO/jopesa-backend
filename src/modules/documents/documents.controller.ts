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
import { DocumentService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from './dto/document.dto';

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a new document',
    description: 'Create a new document entry with file URL and metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    type: DocumentResponseDto,
  })
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all documents',
    description: 'Retrieve paginated list of documents with optional filtering',
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
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: String,
    description: 'Filter by tags (comma-separated)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of documents',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.documentService.findAll(skip, take, category, tagArray);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all document categories',
    description: 'Retrieve list of all available document categories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
  })
  async getCategories() {
    return this.documentService.getCategories();
  }

  @Get('top-downloads')
  @ApiOperation({
    summary: 'Get most downloaded documents',
    description: 'Retrieve most downloaded documents',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of documents to return',
  })
  @ApiResponse({
    status: 200,
    description: 'List of most downloaded documents',
  })
  async getMostDownloaded(@Query('limit') limit?: number) {
    return this.documentService.getMostDownloaded(limit || 10);
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Get documents by category',
    description: 'Retrieve all documents from a specific category',
  })
  @ApiParam({
    name: 'category',
    type: String,
    description: 'Category name',
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
    description: 'Documents for the category',
  })
  async getByCategory(
    @Param('category') category: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.documentService.getByCategory(category, skip, take);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get document by ID',
    description: 'Retrieve document details and increment download count',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the document',
  })
  @ApiResponse({
    status: 200,
    description: 'Document found',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async findById(@Param('id') id: string) {
    return this.documentService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update document',
    description: 'Update document metadata',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the document',
  })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete document',
    description: 'Delete a document entry',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the document',
  })
  @ApiResponse({
    status: 204,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
