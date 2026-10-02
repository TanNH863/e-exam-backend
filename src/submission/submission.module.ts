import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { SubmitExamHandler } from './handlers/submit-exam.handler';

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmitExamHandler],
  exports: [SubmissionService],
})
export class SubmissionModule {}