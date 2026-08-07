import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { PrismaService } from 'src/prisma.service';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { DefaultAdminGuard } from 'src/modules/auth/guards/default-admin.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard, DefaultAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/contributions')
export class ContributionsAdminController {
  constructor(private readonly svc: ContributionsService, private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.svc.findAll();
  }

  @Get(':id/payments')
  async contributionPayments(@Param('id') id: string) {
    const payments = await this.prisma.contributionPayment.findMany({ where: { contributionId: id } });
    return payments;
  }

  @Get('/payments')
  async listPayments(@Query('take') take = '50', @Query('skip') skip = '0') {
    const t = Number(take);
    const s = Number(skip);
    return this.prisma.payment.findMany({ take: t, skip: s, orderBy: { createdAt: 'desc' } });
  }
}
