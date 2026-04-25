import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: {
        ...data,
        publishedAt: new Date(),
      },
    });
  }

  async findAll(skip: number = 0, take: number = 10, type?: string) {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      skip,
      take,
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
      ],
    });

    const total = await this.prisma.announcement.count({ where });

    return {
      data: announcements,
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async update(id: string, data: UpdateAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return this.prisma.announcement.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.announcement.delete({
      where: { id },
    });

    return { message: 'Announcement deleted successfully' };
  }

  async getPinned() {
    return this.prisma.announcement.findMany({
      where: { isPinned: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
