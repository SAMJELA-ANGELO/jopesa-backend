import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';

@Module({
  providers: [BranchService, PrismaService],
  controllers: [BranchController],
  exports: [BranchService],
})
export class BranchModule {}
