import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAlumniDto, UpdateAlumniProfileDto } from './dto/alumni.dto';

@Injectable()
export class AlumniService {
  constructor(private prisma: PrismaService) {}

  async createAlumni(data: CreateAlumniDto) {
    // Check if batch exists
    const batchExists = await this.prisma.batch.findUnique({
      where: { id: data.batchId },
    });

    if (!batchExists) {
      throw new BadRequestException('Batch not found');
    }

    // Check if branch exists
    const branchExists = await this.prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branchExists) {
      throw new BadRequestException('Branch not found');
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // TODO: Hash password before storing
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'ALUMNI',
      },
    });

    // Create alumni profile
    const alumniProfile = await this.prisma.alumniProfile.create({
      data: {
        userId: user.id,
        batchId: data.batchId,
        branchId: data.branchId,
      },
      include: {
        user: true,
        batch: true,
        branch: true,
      },
    });

    return alumniProfile;
  }

  async findAll(skip: number = 0, take: number = 10, batch?: string, branch?: string) {
    const where: any = {};

    if (batch) {
      where.batch = { id: batch };
    }
    if (branch) {
      where.branch = { id: branch };
    }

    const alumni = await this.prisma.alumniProfile.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        batch: true,
        branch: true,
      },
    });

    const total = await this.prisma.alumniProfile.count({ where });

    return {
      data: alumni,
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        batch: true,
        branch: true,
      },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found');
    }

    return alumni;
  }

  async findByEmail(email: string) {
    const alumni = await this.prisma.alumniProfile.findFirst({
      where: {
        user: { email },
      },
      include: {
        user: true,
        batch: true,
        branch: true,
      },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found');
    }

    return alumni;
  }

  async updateProfile(id: string, data: UpdateAlumniProfileDto) {
    const alumni = await this.prisma.alumniProfile.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        batch: true,
        branch: true,
      },
    });

    return alumni;
  }

  async deleteAlumni(id: string) {
    // Get user ID first
    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { id },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found');
    }

    // Delete alumni profile (cascades to user)
    await this.prisma.alumniProfile.delete({
      where: { id },
    });

    return { message: 'Alumni profile deleted successfully' };
  }

  async getAlumniByBatch(batchId: string, skip: number = 0, take: number = 10) {
    const alumni = await this.prisma.alumniProfile.findMany({
      where: { batchId },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        branch: true,
      },
    });

    const total = await this.prisma.alumniProfile.count({ where: { batchId } });

    return {
      data: alumni,
      total,
      skip,
      take,
    };
  }

  async getAlumniByBranch(branchId: string, skip: number = 0, take: number = 10) {
    const alumni = await this.prisma.alumniProfile.findMany({
      where: { branchId },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        batch: true,
      },
    });

    const total = await this.prisma.alumniProfile.count({ where: { branchId } });

    return {
      data: alumni,
      total,
      skip,
      take,
    };
  }
}
