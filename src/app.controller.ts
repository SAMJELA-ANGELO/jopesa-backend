import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running successfully',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'API health status',
    description: 'Get detailed API health information',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status returned',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-04-25T12:00:00Z',
        uptime: 12345,
        environment: 'development',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'JOPESA Backend API is running',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

