import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBranchDto) {
    // Check if branch with same name or code already exists
    const existingBranch = await this.prisma.branch.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }],
      },
    });

    if (existingBranch) {
      throw new ConflictException(
        'Branch with this name or code already exists',
      );
    }

    return this.prisma.branch.create({
      data,
    });
  }

  async findAll(skip: number = 0, take: number = 10) {
    const branches = await this.prisma.branch.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { alumni: true },
        },
      },
    });

    const total = await this.prisma.branch.count();

    return {
      data: branches,
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        alumni: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { alumni: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async findByCode(code: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { code },
      include: {
        _count: {
          select: { alumni: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with code ${code} not found`);
    }

    return branch;
  }

  async update(id: string, data: UpdateBranchDto) {
    // Check if branch exists
    await this.findById(id);

    // If updating name or code, check for conflicts
    if (data.name || data.code) {
      const existingBranch = await this.prisma.branch.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.name ? [{ name: data.name }] : []),
                ...(data.code ? [{ code: data.code }] : []),
              ],
            },
          ],
        },
      });

      if (existingBranch) {
        throw new ConflictException(
          'Branch with this name or code already exists',
        );
      }
    }

    return this.prisma.branch.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { alumni: true },
        },
      },
    });
  }

  async delete(id: string) {
    // Check if branch exists
    await this.findById(id);

    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
