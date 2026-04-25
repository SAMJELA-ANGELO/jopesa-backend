import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDocumentDto) {
    return this.prisma.document.create({
      data,
    });
  }

  async findAll(skip: number = 0, take: number = 10, category?: string, tags?: string[]) {
    const where: any = {};

    if (category) {
      where.category = category;
    }
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const documents = await this.prisma.document.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.document.count({ where });

    return {
      data: documents,
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Increment downloads count
    await this.prisma.document.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return document;
  }

  async update(id: string, data: UpdateDocumentDto) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.document.delete({
      where: { id },
    });

    return { message: 'Document deleted successfully' };
  }

  async getByCategory(category: string, skip: number = 0, take: number = 10) {
    const documents = await this.prisma.document.findMany({
      where: { category },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.document.count({ where: { category } });

    return {
      data: documents,
      total,
      skip,
      take,
    };
  }

  async getCategories() {
    const categories = await this.prisma.document.findMany({
      distinct: ['category'],
      select: {
        category: true,
      },
    });

    return categories.map(doc => doc.category);
  }

  async getMostDownloaded(limit: number = 10) {
    return this.prisma.document.findMany({
      take: limit,
      orderBy: { downloads: 'desc' },
    });
  }
}
