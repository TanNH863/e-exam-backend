import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from '@prisma/client';
import { BulkCreateQuestionsCommand } from './commands/bulk-create-questions.command';
import { CreateQuestionCommand } from './commands/create-question.command';
import { UpdateQuestionCommand } from './commands/update-question.command';
import { DeleteQuestionCommand } from './commands/delete-question.command';
import { GetQuestionsQuery } from './queries/get-questions.query';
import { GetQuestionQuery } from './queries/get-question.query';

@Controller()
export class QuestionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('questions/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.commandBus.execute(new BulkCreateQuestionsCommand(file.buffer));
  }

  @Post('question')
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<{ message: string; question: Question }> {
    return this.commandBus.execute(new CreateQuestionCommand(createQuestionDto));
  }

  @Get('questions')
  async findAll(
    @Query('examId') examId?: string,
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<Question[]> {
    if (examId) {
      return this.queryBus.execute(new GetQuestionsQuery({ examId, pageNumber, pageSize }));
    }
    return this.queryBus.execute(new GetQuestionsQuery({ pageNumber, pageSize }));
  }

  @Get('question/:id')
  findOne(@Param('id') id: string): Promise<Question> {
    return this.queryBus.execute(new GetQuestionQuery(id));
  }

  @Put('question/:id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.commandBus.execute(new UpdateQuestionCommand(id, updateQuestionDto));
  }

  @Delete('question/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
