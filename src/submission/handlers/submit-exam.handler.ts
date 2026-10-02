import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitExamCommand } from '../commands/submit-exam.command';
import { SubmissionService } from '../submission.service';

@Injectable()
@CommandHandler(SubmitExamCommand)
export class SubmitExamHandler implements ICommandHandler<SubmitExamCommand> {
  constructor(private readonly submissionService: SubmissionService) {}

  async execute(command: SubmitExamCommand) {
    return this.submissionService.execute(command.examId, command.dto);
  }
}