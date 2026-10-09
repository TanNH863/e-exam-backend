import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { DatabaseModule } from '../database.module';
import { CreateExamHandler } from './handlers/create-exam.handler';
import { GetExamsHandler } from './handlers/get-exams.handler';
import { GetExamHandler } from './handlers/get-exam.handler';
import { GetUpcomingExamsHandler } from './handlers/get-upcoming-exams.handler';
import { UpdateExamHandler } from './handlers/update-exam.handler';
import { UpdateExamQuestionsHandler } from './handlers/update-exam-questions.handler';
import { DeleteExamHandler } from './handlers/delete-exam.handler';

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [ExamController],
  providers: [
    ExamService,
    CreateExamHandler,
    GetExamsHandler,
    GetExamHandler,
    GetUpcomingExamsHandler,
    UpdateExamHandler,
    UpdateExamQuestionsHandler,
    DeleteExamHandler,
  ],
  exports: [ExamService],
})
export class ExamModule {}
