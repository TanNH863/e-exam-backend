import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Exam } from '@prisma/client';
import { GetUpcomingExamsQuery } from '../queries/get-upcoming-exams.query';
import { ExamService } from '../exam.service';

@QueryHandler(GetUpcomingExamsQuery)
export class GetUpcomingExamsHandler implements IQueryHandler<GetUpcomingExamsQuery> {
  constructor(private readonly examService: ExamService) {}

  async execute(): Promise<Exam[]> {
    return this.examService.getUpcomingExams();
  }
}