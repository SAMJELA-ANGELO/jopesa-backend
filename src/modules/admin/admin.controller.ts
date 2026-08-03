import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description: 'Retrieve paginated list of all users with their details',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.adminService.getAllUsers(parseInt(skip), parseInt(take));
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Get user details (Admin only)',
    description: 'Retrieve detailed information about a specific user',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Put('users/:userId/role')
  @ApiOperation({
    summary: 'Update user role (Admin only)',
    description: 'Change a user role to ADMIN, MEMBER, or ALUMNI',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description: 'Permanently delete a user account',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(@Param('userId') userId: string) {
    await this.adminService.deleteUser(userId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get platform statistics (Admin only)',
    description: 'Retrieve platform statistics including user counts and engagement',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('registrations')
  @ApiOperation({
    summary: 'Get event registrations (Admin only)',
    description: 'Retrieve paginated list of event registrations with alumni and event details',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: 200, description: 'Registrations retrieved successfully' })
  async getRegistrations(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.adminService.getRegistrations(parseInt(skip), parseInt(take));
  }

  @Put('registrations/:registrationId/status')
  @ApiOperation({
    summary: 'Update registration status (Admin only)',
    description: 'Approve, flag, or decline an event registration',
  })
  @ApiParam({ name: 'registrationId', type: String, description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Registration status updated successfully' })
  async updateRegistrationStatus(
    @Param('registrationId') registrationId: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateRegistrationStatus(registrationId, status);
  }

  @Delete('registrations/:registrationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete registration (Admin only)',
    description: 'Remove an event registration record',
  })
  @ApiParam({ name: 'registrationId', type: String, description: 'Registration ID' })
  @ApiResponse({ status: 204, description: 'Registration deleted successfully' })
  async deleteRegistration(@Param('registrationId') registrationId: string) {
    await this.adminService.deleteRegistration(registrationId);
  }

  @Put('alumni/:userId/verify')
  @ApiOperation({
    summary: 'Verify alumni account (Admin only)',
    description: 'Mark an alumni profile as verified',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni verified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni profile not found',
  })
  async verifyAlumni(@Param('userId') userId: string) {
    return this.adminService.verifyAlumni(userId);
  }

  @Put('alumni/:userId/unverify')
  @ApiOperation({
    summary: 'Unverify alumni account (Admin only)',
    description: 'Remove verified status from an alumni profile',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni unverified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni profile not found',
  })
  async unverifyAlumni(@Param('userId') userId: string) {
    return this.adminService.unverifyAlumni(userId);
  }
}
