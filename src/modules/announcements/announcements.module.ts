import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AnnouncementService } from './announcements.service';
import { AnnouncementController } from './announcements.controller';

@Module({
  providers: [AnnouncementService, PrismaService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
