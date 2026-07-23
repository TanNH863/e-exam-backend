import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteExamCommand } from '../commands/delete-exam.command';
import { ExamService } from '../exam.service';

@CommandHandler(DeleteExamCommand)
export class DeleteExamHandler implements ICommandHandler<DeleteExamCommand> {
  constructor(private readonly examService: ExamService) {}

  async execute(command: DeleteExamCommand): Promise<{ message: string }> {
    return this.examService.remove(command.id);
  }
}