import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Exam } from '@prisma/client';
import { UpdateExamCommand } from '../commands/update-exam.command';
import { ExamService } from '../exam.service';

@CommandHandler(UpdateExamCommand)
export class UpdateExamHandler implements ICommandHandler<UpdateExamCommand> {
  constructor(private readonly examService: ExamService) {}

  async execute(command: UpdateExamCommand): Promise<Exam> {
    return this.examService.updateExamInfo(command.id, command.updateExamDto);
  }
}