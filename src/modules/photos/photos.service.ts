import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateEventPhotoDto, CreateEventPhotosBulkDto } from './dto/photo.dto';

@Injectable()
export class PhotoService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEventPhotoDto) {
    const event = await this.prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.eventPhoto.create({
      data: {
        eventId: data.eventId,
        url: data.url,
        publicId: data.publicId,
        caption: data.caption,
      },
      include: {
        event: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async createBulk(data: CreateEventPhotosBulkDto) {
    const event = await this.prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const urls = (data.urls || []).filter((url) => typeof url === 'string' && url.length > 0);
    if (urls.length === 0) {
      throw new BadRequestException('At least one image URL is required');
    }

    await this.prisma.eventPhoto.createMany({
      data: urls.map((url, index) => ({
        eventId: data.eventId,
        url,
        publicId: data.publicIds?.[index],
      })),
    });

    return this.prisma.eventPhoto.findMany({
      where: {
        eventId: data.eventId,
        url: { in: urls },
      },
      include: {
        event: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(skip = 0, take = 100, eventId?: string) {
    const where = eventId ? { eventId } : {};

    const [data, total] = await Promise.all([
      this.prisma.eventPhoto.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: { id: true, title: true, status: true },
          },
        },
      }),
      this.prisma.eventPhoto.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async findById(id: string) {
    const photo = await this.prisma.eventPhoto.findUnique({
      where: { id },
      include: {
        event: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  async delete(id: string) {
    const photo = await this.prisma.eventPhoto.findUnique({ where: { id } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.eventPhoto.delete({ where: { id } });
    return { message: 'Photo deleted successfully' };
  }
}
