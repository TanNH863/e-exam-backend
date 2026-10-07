import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Exam } from '@prisma/client';
import { GetExamsByStatus } from '../queries/get-exams-by-status.query';
import { ExamService } from '../exam.service';

@QueryHandler(GetExamsByStatus)
export class GetExamsByStatusHandler implements IQueryHandler<GetExamsByStatus> {
	constructor(private readonly examService: ExamService) {}

	async execute(query: GetExamsByStatus): Promise<Exam[]> {
		return this.examService.getExamsByStatus(query.status);
	}
}