import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { DefaultAdminGuard } from 'src/modules/auth/guards/default-admin.guard';
import { ContributionsService } from './contributions.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InitiateContributionPaymentDto } from './dto/initiate-contribution-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('contributions')
export class ContributionPaymentsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @UseGuards(JwtGuard)
  @Post(':id/payments')
  async createPayment(
    @Param('id') contributionId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ) {
    return this.contributionsService.createPayment(contributionId, createPaymentDto, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/payments/initiate')
  async initiatePayment(
    @Param('id') contributionId: string,
    @Body() initiatePaymentDto: InitiateContributionPaymentDto,
    @Request() req,
  ) {
    return this.contributionsService.initiatePayment(contributionId, initiatePaymentDto, req.user.id);
  }

  @Get(':id/payments/:paymentId')
  async findOnePayment(@Param('id') contributionId: string, @Param('paymentId') paymentId: string) {
    return this.contributionsService.findOnePayment(contributionId, paymentId);
  }

  @UseGuards(JwtGuard, DefaultAdminGuard)
  @Put(':id/payments/:paymentId/status')
  async updatePaymentStatus(
    @Param('id') contributionId: string,
    @Param('paymentId') paymentId: string,
    @Body() updateStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.contributionsService.updatePaymentStatus(contributionId, paymentId, updateStatusDto);
  }
}
