import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';

@Module({
  providers: [CommunityService, PrismaService],
  controllers: [CommunityController],
  exports: [CommunityService],
})
export class CommunityModule {}
