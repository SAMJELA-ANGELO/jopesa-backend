import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AlumniService } from './alumni.service';
import { AlumniController } from './alumni.controller';

@Module({
  providers: [AlumniService, PrismaService],
  controllers: [AlumniController],
  exports: [AlumniService],
})
export class AlumniModule {}
