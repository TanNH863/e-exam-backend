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

@Controller()
export class SubmissionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('submit/:examId')
  create(
    @Param('examId') examId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateSubmissionDto,
  ) {
    return this.commandBus.execute(new SubmitExamCommand(examId, dto));
  }
}