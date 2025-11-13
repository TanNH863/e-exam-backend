import { Module } from '@nestjs/common';
import { dbProvider } from './database.provider';

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DatabaseModule {}
