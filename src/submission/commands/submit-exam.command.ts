import { CreateSubmissionDto } from '../dto/create-submission.dto';

export class SubmitExamCommand {
  constructor(
    public readonly examId: string,
    public readonly dto: CreateSubmissionDto,
  ) {}
}