import {
  Body,
  Controller,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SubmitExamCommand } from './commands/submit-exam.command';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { StartExamCommand } from './commands/start.command';

@Controller()
export class SubmissionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('start/:examId')
  start(
    @Param('examId') examId: string,
    @Body('studentId', new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    studentId: string,
  ) {
    return this.commandBus.execute(new StartExamCommand(examId, studentId));
  }

  @Post('submit/:examId')
  create(
    @Param('examId') examId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateSubmissionDto,
  ) {
    return this.commandBus.execute(new SubmitExamCommand(examId, dto));
  }
}