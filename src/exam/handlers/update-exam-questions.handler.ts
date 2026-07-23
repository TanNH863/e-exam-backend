import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateExamQuestionsCommand } from '../commands/update-exam-questions.command';
import { ExamService } from '../exam.service';

@CommandHandler(UpdateExamQuestionsCommand)
export class UpdateExamQuestionsHandler implements ICommandHandler<UpdateExamQuestionsCommand> {
  constructor(private readonly examService: ExamService) {}

  async execute(command: UpdateExamQuestionsCommand): Promise<{ message: string }> {
    return this.examService.updateQuestionListInExam(command.examId, command.dto);
  }
}