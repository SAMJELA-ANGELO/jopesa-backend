import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommunityService } from './community.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PostResponseDto,
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
} from './dto/community.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ==================== POSTS ====================

  @Post('posts')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new post',
    description: 'Create a new post in the alumni community',
  })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createPost(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.communityService.createPost(req.user.id, createPostDto);
  }

  @Get('posts')
  @ApiOperation({
    summary: 'Get all posts',
    description: 'Retrieve paginated list of all alumni posts',
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
    description: 'Posts retrieved successfully',
  })
  async getAllPosts(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.communityService.getAllPosts(parseInt(skip), parseInt(take));
  }

  @Get('posts/:postId')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieve a specific post with its comments',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'Post ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async getPostById(@Param('postId') postId: string) {
    return this.communityService.getPostById(postId);
  }

  @Put('posts/:postId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a post',
    description: 'Update your own post',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'Post ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you can only update your own posts',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async updatePost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.communityService.updatePost(req.user.id, postId, updatePostDto);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a post',
    description: 'Delete your own post',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'Post ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you can only delete your own posts',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async deletePost(@Request() req: any, @Param('postId') postId: string) {
    await this.communityService.deletePost(req.user.id, postId);
  }

  // ==================== COMMENTS ====================

  @Post('posts/:postId/comments')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comment on a post',
    description: 'Add a comment to an alumni post',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'Post ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async createComment(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.communityService.createComment(
      req.user.id,
      postId,
      createCommentDto,
    );
  }

  @Get('posts/:postId/comments')
  @ApiOperation({
    summary: 'Get comments for a post',
    description: 'Retrieve paginated list of comments for a specific post',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'Post ID',
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
    description: 'Comments retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.communityService.getCommentsByPost(
      postId,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Put('comments/:commentId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Update your own comment',
  })
  @ApiParam({
    name: 'commentId',
    type: String,
    description: 'Comment ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you can only update your own comments',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async updateComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.communityService.updateComment(
      req.user.id,
      commentId,
      updateCommentDto,
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Delete your own comment',
  })
  @ApiParam({
    name: 'commentId',
    type: String,
    description: 'Comment ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you can only delete your own comments',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async deleteComment(@Request() req: any, @Param('commentId') commentId: string) {
    await this.communityService.deleteComment(req.user.id, commentId);
  }
}
