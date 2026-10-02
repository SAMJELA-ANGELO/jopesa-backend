import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEventDto) {
    // Check if all batches exist
    const batches = await this.prisma.batch.findMany({
      where: { id: { in: data.batchIds } },
    });

    if (batches.length !== data.batchIds.length) {
      throw new BadRequestException('One or more batches not found');
    }

    const images = this.resolveImages(data.image, data.images);
    const primaryImage = images[0];

    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        image: primaryImage,
        images,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        isVirtual: data.isVirtual,
        meetLink: data.meetLink,
        status: data.status ?? 'PUBLISHED',
        registrationForm: data.registrationForm as any,
        batches: {
          connect: data.batchIds.map((id) => ({ id })),
        },
      } as any,
      include: {
        batches: true,
      } as any,
    });
  }

  async findAll(skip: number = 0, take: number = 10, status?: string, batchId?: string) {
    const where: any = {};

    if (status) {
      const statuses = status.split(',').map((value) => value.trim()).filter(Boolean);
      where.status = statuses.length > 1 ? { in: statuses } : statuses[0];
    }
    if (batchId) {
      where.batches = {
        some: { id: batchId },
      };
    }

    const events = await this.prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { startDate: 'desc' },
      include: {
        batches: true,
        _count: {
          select: { attendees: true },
        },
      },
    } as any);

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
        batches: true,
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
    } as any);

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

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.images !== undefined || data.image !== undefined) {
      const images = this.resolveImages(data.image, data.images ?? (data.image ? [data.image] : undefined));
      updateData.images = images;
      updateData.image = images[0] ?? null;
    }
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.isVirtual !== undefined) updateData.isVirtual = data.isVirtual;
    if (data.meetLink !== undefined) updateData.meetLink = data.meetLink;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.registrationForm !== undefined) updateData.registrationForm = data.registrationForm;
    if (data.batchIds !== undefined) {
      updateData.batches = {
        set: [],
        connect: data.batchIds.map((id) => ({ id })),
      };
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        batches: true,
      },
    } as any);
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
        batches: true,
        _count: {
          select: { attendees: true },
        },
      },
    } as any);

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

  async registerForEvent(
    eventId: string,
    userId: string,
    responses: Record<string, unknown>,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('This event is not open for registration');
    }

    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumni) {
      throw new BadRequestException('Alumni profile not found for this user');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_alumniId: {
          eventId,
          alumniId: alumni.id,
        },
      },
    });

    if (existing) {
      const updateData: any = {
        responses: responses as any,
        status: 'PENDING',
      };
      return this.prisma.eventRegistration.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    const formFields = Array.isArray(event.registrationForm)
      ? (event.registrationForm as Array<{ id: string; label: string; required?: boolean; type?: string }>)
      : [];

    for (const field of formFields) {
      if (!field.required) continue;
      const value = responses?.[field.id];
      const empty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);
      if (empty) {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }
    }

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        alumniId: alumni.id,
        responses: responses as any,
      },
    });

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          connect: { id: alumni.id },
        },
      },
    });

    return registration;
  }

  async getMyRegistration(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumni) {
      return { registered: false, registration: null };
    }

    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_alumniId: {
          eventId,
          alumniId: alumni.id,
        },
      },
    });

    return {
      registered: !!registration,
      registration,
    };
  }

  private resolveImages(image?: string, images?: string[]): string[] {
    const fromArray = Array.isArray(images)
      ? images.filter((url): url is string => typeof url === 'string' && url.length > 0)
      : [];
    if (fromArray.length > 0) {
      return Array.from(new Set(fromArray));
    }
    if (image) {
      return [image];
    }
    return [];
  }
}
