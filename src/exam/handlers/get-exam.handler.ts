import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Exam } from '@prisma/client';
import { GetExamQuery } from '../queries/get-exam.query';
import { ExamService } from '../exam.service';

@QueryHandler(GetExamQuery)
export class GetExamHandler implements IQueryHandler<GetExamQuery> {
  constructor(private readonly examService: ExamService) {}

  async execute(query: GetExamQuery): Promise<Exam> {
    return this.examService.findOne(query.id);
  }
}