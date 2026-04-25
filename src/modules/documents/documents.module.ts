import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DocumentService } from './documents.service';
import { DocumentController } from './documents.controller';

@Module({
  providers: [DocumentService, PrismaService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
