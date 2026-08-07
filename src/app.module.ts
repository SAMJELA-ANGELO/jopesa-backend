import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AdminModule } from './modules/admin/admin.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { AuthModule } from './modules/auth/auth.module';
import { BatchModule } from './modules/batch/batch.module';
import { BranchModule } from './modules/branch/branch.module';
import { CommunityModule } from './modules/community/community.module';
import { EventModule } from './modules/events/events.module';
import { AnnouncementModule } from './modules/announcements/announcements.module';
import { DocumentModule } from './modules/documents/documents.module';
import { UploadModule } from './modules/upload/upload.module';
import { PhotoModule } from './modules/photos/photos.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    AlumniModule,
    BatchModule,
    BranchModule,
    CommunityModule,
    EventModule,
    AnnouncementModule,
    DocumentModule,
    UploadModule,
    PhotoModule,
    PaymentsModule,
    ContributionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
