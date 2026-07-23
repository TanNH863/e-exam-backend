import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQuestionCommand } from '../commands/update-question.command';
import { QuestionService } from '../question.service';

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionHandler implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private readonly questionService: QuestionService) {}
  async execute(command: UpdateQuestionCommand) {
    return this.questionService.update(command.id, command.updateDto);
  }
}