import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EventService } from './events.service';
import { EventController } from './events.controller';

@Module({
  providers: [EventService, PrismaService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
