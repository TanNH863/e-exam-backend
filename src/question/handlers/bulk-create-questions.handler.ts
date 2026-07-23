import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkCreateQuestionsCommand } from '../commands/bulk-create-questions.command';
import { QuestionService } from '../question.service';

@CommandHandler(BulkCreateQuestionsCommand)
export class BulkCreateQuestionsHandler implements ICommandHandler<BulkCreateQuestionsCommand> {
  constructor(private readonly questionService: QuestionService) {}
  async execute(command: BulkCreateQuestionsCommand) {
    return this.questionService.bulkCreate(command.fileBuffer);
  }
}