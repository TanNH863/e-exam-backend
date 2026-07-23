import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { DatabaseModule } from '../database.module';
import { CreateQuestionHandler } from './handlers/create-question.handler';
import { BulkCreateQuestionsHandler } from './handlers/bulk-create-questions.handler';
import { UpdateQuestionHandler } from './handlers/update-question.handler';
import { DeleteQuestionHandler } from './handlers/delete-question.handler';
import { GetQuestionsHandler } from './handlers/get-questions.handler';
import { GetQuestionHandler } from './handlers/get-question.handler';

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [QuestionController],
  providers: [
    QuestionService,
    CreateQuestionHandler,
    BulkCreateQuestionsHandler,
    UpdateQuestionHandler,
    DeleteQuestionHandler,
    GetQuestionsHandler,
    GetQuestionHandler,
  ],
  exports: [QuestionService],
})
export class QuestionModule {}
