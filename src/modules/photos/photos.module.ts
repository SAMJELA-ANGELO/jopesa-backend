import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PhotoService } from './photos.service';
import { PhotoController } from './photos.controller';

@Module({
  providers: [PhotoService, PrismaService],
  controllers: [PhotoController],
  exports: [PhotoService],
})
export class PhotoModule {}
