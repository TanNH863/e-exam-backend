import { UpdateExamDto } from '../dto/update-exam.dto';

export class UpdateExamCommand {
  constructor(
    public readonly id: string,
    public readonly updateExamDto: UpdateExamDto,
  ) {}
}