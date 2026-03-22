import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from '@prisma/client';

@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.questionService.bulkCreate(file.buffer);
  }

  @Post('question')
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<{ message: string; question: Question }> {
    return this.questionService.create(createQuestionDto);
  }

  @Get('questions')
  async findAll(@Query('examId') examId?: string): Promise<Question[]> {
    if (examId) {
      return this.questionService.findAllByExam(examId);
    }
    return this.questionService.findAll();
  }

  @Get('question/:id')
  findOne(@Param('id') id: string): Promise<Question> {
    return this.questionService.findOne(id);
  }

  @Put('question/:id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete('question/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.questionService.remove(id);
  }
}
