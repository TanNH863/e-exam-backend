import { Module } from '@nestjs/common';
import { prismaProvider, PrismaService } from './database.provider';

@Module({
  providers: [PrismaService, prismaProvider],
  exports: [PrismaService, prismaProvider],
})
export class DatabaseModule {}
