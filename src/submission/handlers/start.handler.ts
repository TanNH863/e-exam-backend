import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartExamCommand } from '../commands/start.command';
import { SubmissionService } from '../submission.service';

@Injectable()
@CommandHandler(StartExamCommand)
export class StartExamHandler implements ICommandHandler<StartExamCommand> {
	constructor(private readonly submissionService: SubmissionService) {}
	
	async execute(command: StartExamCommand) {
		return this.submissionService.start(command.examId, command.studentId);
	}
}