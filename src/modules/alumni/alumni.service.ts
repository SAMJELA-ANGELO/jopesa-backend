import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { computeMembershipBadge } from './membership-badge';
import { CreateAlumniDto, UpdateAlumniProfileDto } from './dto/alumni.dto';
import * as bcrypt from 'bcrypt';

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

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
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
    const existing = await this.prisma.alumniProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Alumni profile not found');
    }

    if (data.batchId) {
      const batch = await this.prisma.batch.findUnique({ where: { id: data.batchId } });
      if (!batch) {
        throw new BadRequestException('Batch not found');
      }
    }

    if (data.branchId) {
      const branch = await this.prisma.branch.findUnique({ where: { id: data.branchId } });
      if (!branch) {
        throw new BadRequestException('Branch not found');
      }
    }

    const {
      firstName,
      lastName,
      phone,
      batchId,
      branchId,
      bio,
      relationshipStatus,
      profileImage,
      coverImage,
      linkedIn,
      twitter,
      instagram,
      website,
      currentRole,
      currentCompany,
      location,
    } = data;

    if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
      await this.prisma.user.update({
        where: { id: existing.userId },
        data: {
          ...(firstName !== undefined ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
    }

    const alumni = await this.prisma.alumniProfile.update({
      where: { id },
      data: {
        ...(batchId !== undefined ? { batchId } : {}),
        ...(branchId !== undefined ? { branchId } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(relationshipStatus !== undefined ? { relationshipStatus } : {}),
        ...(profileImage !== undefined ? { profileImage } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(linkedIn !== undefined ? { linkedIn } : {}),
        ...(twitter !== undefined ? { twitter } : {}),
        ...(instagram !== undefined ? { instagram } : {}),
        ...(website !== undefined ? { website } : {}),
        ...(currentRole !== undefined ? { currentRole } : {}),
        ...(currentCompany !== undefined ? { currentCompany } : {}),
        ...(location !== undefined ? { location } : {}),
      },
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

  async updateMyProfile(userId: string, data: UpdateAlumniProfileDto) {
    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found for this user');
    }

    return this.updateProfile(alumni.id, data);
  }

  async findByUserId(userId: string) {
    const alumni = await this.prisma.alumniProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            contributionPayments: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        batch: true,
        branch: true,
      },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found for this user');
    }

    return alumni;
  }

  private serializePublicMember(member: any) {
    const user = member?.user;
    const contributionPayments = Array.isArray(user?.contributionPayments) ? user.contributionPayments : [];
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Alumni';

    return {
      ...member,
      membershipBadge: member?.membershipBadge ?? computeMembershipBadge(contributionPayments),
      user: {
        ...user,
        fullName,
        bio: member?.bio ?? user?.bio ?? null,
        profileImage: member?.profileImage ?? user?.profileImage ?? null,
        coverImage: member?.coverImage ?? user?.coverImage ?? null,
        currentRole: member?.currentRole ?? user?.currentRole ?? null,
        currentCompany: member?.currentCompany ?? user?.currentCompany ?? null,
        location: member?.location ?? user?.location ?? null,
        linkedIn: member?.linkedIn ?? user?.linkedIn ?? null,
        twitter: member?.twitter ?? user?.twitter ?? null,
        instagram: member?.instagram ?? user?.instagram ?? null,
        website: member?.website ?? user?.website ?? null,
      },
    };
  }

  async getDirectoryMembers(skip: number = 0, take: number = 100, batch?: string, branch?: string) {
    const where: any = {};

    if (batch) {
      where.batch = { id: batch };
    }
    if (branch) {
      where.branch = { id: branch };
    }

    const members = await this.prisma.alumniProfile.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            contributionPayments: {
              include: { contribution: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        batch: true,
        branch: true,
      },
    });

    const total = await this.prisma.alumniProfile.count({ where });

    return {
      data: members.map((member) => this.serializePublicMember(member)),
      total,
      skip,
      take,
    };
  }

  async getPublicMemberById(id: string) {
    const member = await this.prisma.alumniProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            contributionPayments: {
              include: { contribution: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        batch: true,
        branch: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Alumni profile not found');
    }

    return this.serializePublicMember(member);
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
