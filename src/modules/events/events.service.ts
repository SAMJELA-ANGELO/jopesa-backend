import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEventDto) {
    // Check if batch exists
    const batchExists = await this.prisma.batch.findUnique({
      where: { id: data.batchId },
    });

    if (!batchExists) {
      throw new BadRequestException('Batch not found');
    }

    return this.prisma.event.create({
      data,
      include: {
        batch: true,
      },
    });
  }

  async findAll(skip: number = 0, take: number = 10, status?: string, batchId?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (batchId) {
      where.batchId = batchId;
    }

    const events = await this.prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { startDate: 'desc' },
      include: {
        batch: true,
        _count: {
          select: { attendees: true },
        },
      },
    });

    const total = await this.prisma.event.count({ where });

    return {
      data: events,
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        batch: true,
        attendees: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, data: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        batch: true,
      },
    });
  }

  async delete(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async addAttendee(eventId: string, alumniId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { id: alumniId },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          connect: { id: alumniId },
        },
      },
    });
  }

  async removeAttendee(eventId: string, alumniId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          disconnect: { id: alumniId },
        },
      },
    });
  }

  async getUpcomingEvents(skip: number = 0, take: number = 10) {
    const now = new Date();
    const events = await this.prisma.event.findMany({
      where: {
        startDate: { gt: now },
        status: 'PUBLISHED',
      },
      skip,
      take,
      orderBy: { startDate: 'asc' },
      include: {
        batch: true,
        _count: {
          select: { attendees: true },
        },
      },
    });

    const total = await this.prisma.event.count({
      where: {
        startDate: { gt: now },
        status: 'PUBLISHED',
      },
    });

    return {
      data: events,
      total,
      skip,
      take,
    };
  }
}
