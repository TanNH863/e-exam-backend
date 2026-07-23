import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExamService } from '../exam.service';
import { CreateExamCommand } from '../commands/create-exam.command';
import { Exam } from '@prisma/client';

@CommandHandler(CreateExamCommand)
export class CreateExamHandler implements ICommandHandler<CreateExamCommand> {
  constructor(private readonly examService: ExamService) {}

  async execute(command: CreateExamCommand): Promise<{ message: string; exam: Exam }> {
    return this.examService.create(command.createExamDto);
  }
}