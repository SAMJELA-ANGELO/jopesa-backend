import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';

@Module({
  providers: [BatchService, PrismaService],
  controllers: [BatchController],
  exports: [BatchService],
})
export class BatchModule {}
