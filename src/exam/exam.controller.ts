import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto, UpdateQuestionsFromExamDto } from './dto/update-exam.dto';
import { Exam } from '@prisma/client';
import { CreateExamCommand } from './commands/create-exam.command';
import { UpdateExamCommand } from './commands/update-exam.command';
import { UpdateExamQuestionsCommand } from './commands/update-exam-questions.command';
import { DeleteExamCommand } from './commands/delete-exam.command';
import { GetExamsQuery } from './queries/get-exams.query';
import { GetExamQuery } from './queries/get-exam.query';
import { GetUpcomingExamsQuery } from './queries/get-upcoming-exams.query';

@Controller()
export class ExamController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('exam')
  create(@Body() dto: CreateExamDto): Promise<{ message: string; exam: Exam }> {
    return this.commandBus.execute(new CreateExamCommand(dto));
  }

  @Get('exams')
  findAll(): Promise<Exam[]> {
    return this.queryBus.execute(new GetExamsQuery());
  }

  @Get('exams/upcoming')
  getUpcomingExams(): Promise<Exam[]> {
    return this.queryBus.execute(new GetUpcomingExamsQuery());
  }

  @Get('exam/:id')
  findOne(@Param('id') id: string): Promise<Exam> {
    return this.queryBus.execute(new GetExamQuery(id));
  }

  @Put('exam/:id')
  update(@Param('id') id: string, @Body() dto: UpdateExamDto): Promise<Exam> {
    return this.commandBus.execute(new UpdateExamCommand(id, dto));
  }

  @Delete('exam/:id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.commandBus.execute(new DeleteExamCommand(id));
  }

  @Put('exam/:id/questions')
  updateQuestions(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionsFromExamDto,
  ): Promise<{ message: string }> {
    return this.commandBus.execute(new UpdateExamQuestionsCommand(id, dto));
  }
}
