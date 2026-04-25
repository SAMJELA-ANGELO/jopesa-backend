import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBatchDto, UpdateBatchDto } from './dto/batch.dto';

@Injectable()
export class BatchService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBatchDto) {
    // Check if batch with same year already exists
    const existingBatch = await this.prisma.batch.findUnique({
      where: { year: data.year },
    });

    if (existingBatch) {
      throw new ConflictException(`Batch with year ${data.year} already exists`);
    }

    return this.prisma.batch.create({
      data,
    });
  }

  async findAll(skip: number = 0, take: number = 10) {
    const batches = await this.prisma.batch.findMany({
      skip,
      take,
      orderBy: { year: 'desc' },
      include: {
        _count: {
          select: { alumni: true },
        },
      },
    });

    const total = await this.prisma.batch.count();

    return {
      data: batches,
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        alumni: {
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
          select: { alumni: true, events: true },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }

  async findByYear(year: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { year },
      include: {
        alumni: true,
        events: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with year ${year} not found`);
    }

    return batch;
  }

  async update(id: string, data: UpdateBatchDto) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return this.prisma.batch.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    await this.prisma.batch.delete({
      where: { id },
    });

    return { message: 'Batch deleted successfully' };
  }
}
