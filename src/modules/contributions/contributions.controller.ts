import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { DefaultAdminGuard } from 'src/modules/auth/guards/default-admin.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Get()
  async findAll() {
    return this.contributionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contributionsService.findOne(id);
  }

  @UseGuards(JwtGuard, RolesGuard, DefaultAdminGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createContributionDto: CreateContributionDto) {
    return this.contributionsService.create(createContributionDto);
  }

  @UseGuards(JwtGuard, RolesGuard, DefaultAdminGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateContributionDto: UpdateContributionDto) {
    return this.contributionsService.update(id, updateContributionDto);
  }

  @UseGuards(JwtGuard, RolesGuard, DefaultAdminGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contributionsService.remove(id);
  }

  @Get(':id/payments')
  async getPayments(@Param('id') id: string) {
    return this.contributionsService.getPayments(id);
  }

  @Get(':id/stats')
  async stats(@Param('id') id: string) {
    return this.contributionsService.statsForContribution(id);
  }
}
