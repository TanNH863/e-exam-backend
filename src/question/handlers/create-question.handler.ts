import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../commands/create-question.command';
import { QuestionService } from '../question.service';

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionHandler implements ICommandHandler<CreateQuestionCommand> {
  constructor(private readonly questionService: QuestionService) {}
  async execute(command: CreateQuestionCommand) {
    return this.questionService.create(command.createQuestionDto);
  }
}