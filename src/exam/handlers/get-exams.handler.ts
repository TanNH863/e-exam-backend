import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Exam } from '@prisma/client';
import { GetExamsQuery } from '../queries/get-exams.query';
import { ExamService } from '../exam.service';

@QueryHandler(GetExamsQuery)
export class GetExamsHandler implements IQueryHandler<GetExamsQuery> {
  constructor(private readonly examService: ExamService) {}

  async execute(): Promise<Exam[]> {
    return this.examService.findAll();
  }
}