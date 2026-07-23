import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuestionQuery } from '../queries/get-question.query';
import { QuestionService } from '../question.service';
import { Question } from '@prisma/client';

@QueryHandler(GetQuestionQuery)
export class GetQuestionHandler implements IQueryHandler<GetQuestionQuery> {
  constructor(private readonly questionService: QuestionService) {}
  async execute(query: GetQuestionQuery): Promise<Question> {
    return this.questionService.findOne(query.id);
  }
}