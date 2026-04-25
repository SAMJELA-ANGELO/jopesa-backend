import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, UpdateCommentDto } from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  // ==================== POSTS ====================

  async createPost(userId: string, data: CreatePostDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify alumni profile exists
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile) {
      throw new BadRequestException('Alumni profile not found');
    }

    return this.prisma.post.create({
      data: {
        content: data.content,
        image: data.image,
        authorId: alumniProfile.id,
      },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async getAllPosts(skip: number = 0, take: number = 10) {
    const posts = await this.prisma.post.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    const total = await this.prisma.post.count();

    return {
      data: posts,
      total,
      skip,
      take,
    };
  }

  async getPostById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async updatePost(userId: string, postId: string, data: UpdatePostDto) {
    const post = await this.getPostById(postId);

    // Check if user owns the post
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile || post.authorId !== alumniProfile.id) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.getPostById(postId);

    // Check if user owns the post
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile || post.authorId !== alumniProfile.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

  // ==================== COMMENTS ====================

  async createComment(userId: string, postId: string, data: CreateCommentDto) {
    // Verify post exists
    await this.getPostById(postId);

    // Get alumni profile
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile) {
      throw new BadRequestException('Alumni profile not found');
    }

    return this.prisma.comment.create({
      data: {
        content: data.content,
        postId,
        authorId: alumniProfile.id,
      },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async getCommentsByPost(postId: string, skip: number = 0, take: number = 20) {
    // Verify post exists
    await this.getPostById(postId);

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.comment.count({ where: { postId } });

    return {
      data: comments,
      total,
      skip,
      take,
    };
  }

  async updateComment(userId: string, commentId: string, data: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile || comment.authorId !== alumniProfile.id) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data,
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile || comment.authorId !== alumniProfile.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
