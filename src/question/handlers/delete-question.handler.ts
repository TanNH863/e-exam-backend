import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteQuestionCommand } from '../commands/delete-question.command';
import { QuestionService } from '../question.service';

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler implements ICommandHandler<DeleteQuestionCommand> {
  constructor(private readonly questionService: QuestionService) {}
  async execute(command: DeleteQuestionCommand) {
    return this.questionService.remove(command.id);
  }
}