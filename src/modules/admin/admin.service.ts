import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(skip: number = 0, take: number = 20) {
    const users = await this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        alumniProfile: {
          select: {
            batch: true,
            branch: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count();

    return { data: users, total, skip, take };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        alumniProfile: {
          include: {
            batch: true,
            branch: true,
            events: {
              select: { id: true, title: true },
            },
            posts: {
              select: { id: true, content: true, createdAt: true },
              take: 5,
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getStats() {
    const [totalUsers, totalAlumni, totalPosts, totalComments, usersByRole] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.alumniProfile.count(),
        this.prisma.post.count(),
        this.prisma.comment.count(),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: true,
        }),
      ]);

    return {
      totalUsers,
      totalAlumni,
      totalPosts,
      totalComments,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
    };
  }

  async getRegistrations(skip: number = 0, take: number = 20) {
    const [registrations, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: { id: true, title: true },
          },
          alumni: {
            select: {
              id: true,
              user: {
                select: { id: true, email: true, firstName: true, lastName: true },
              },
              batch: {
                select: { id: true, name: true, year: true },
              },
              branch: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      this.prisma.eventRegistration.count(),
    ]);

    return { data: registrations, total, skip, take };
  }

  async updateRegistrationStatus(registrationId: string, status: string) {
    const data: any = { status };
    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data,
    });
  }

  async deleteRegistration(registrationId: string) {
    await this.prisma.eventRegistration.delete({
      where: { id: registrationId },
    });
  }

  async verifyAlumni(userId: string) {
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile) {
      throw new NotFoundException('Alumni profile not found');
    }

    return this.prisma.alumniProfile.update({
      where: { userId },
      data: { isVerified: true },
    });
  }

  async unverifyAlumni(userId: string) {
    const alumniProfile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
    });

    if (!alumniProfile) {
      throw new NotFoundException('Alumni profile not found');
    }

    return this.prisma.alumniProfile.update({
      where: { userId },
      data: { isVerified: false },
    });
  }
}
