import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuestionsQuery } from '../queries/get-questions.query';
import { QuestionService } from '../question.service';
import { Question } from '@prisma/client';

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsHandler implements IQueryHandler<GetQuestionsQuery> {
  constructor(private readonly questionService: QuestionService) {}
  async execute(query: GetQuestionsQuery): Promise<Question[]> {
    const { examId, pageNumber, pageSize } = query.params;
    if (examId) return this.questionService.findAllByExam(examId);
    return this.questionService.findAll(pageNumber, pageSize);
  }
}