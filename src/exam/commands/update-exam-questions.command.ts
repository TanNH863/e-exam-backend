import { UpdateQuestionsFromExamDto } from '../dto/update-exam.dto';

export class UpdateExamQuestionsCommand {
  constructor(
    public readonly examId: string,
    public readonly dto: UpdateQuestionsFromExamDto,
  ) {}
}