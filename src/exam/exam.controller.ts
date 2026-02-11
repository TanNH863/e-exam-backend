import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto, UpdateQuestionsFromExamDto } from './dto/update-exam.dto';
import { Exam } from './interfaces/exam.interface';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('exam')
  create(@Body() dto: CreateExamDto): Promise<{ message: string; exam: Exam }> {
    return this.examService.create(dto);
  }

  @Get('exams')
  findAll(): Promise<Exam[]> {
    return this.examService.findAll();
  }

  @Get('exam/:id')
  findOne(@Param('id') id: string): Promise<Exam> {
    return this.examService.findOne(id);
  }

  @Put('exam/:id')
  update(@Param('id') id: string, @Body() dto: UpdateExamDto): Promise<Exam> {
    return this.examService.updateExamInfo(id, dto);
  }

  @Delete('exam/:id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.examService.remove(id);
  }

  @Put('exam/:id/questions')
  updateQuestions(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionsFromExamDto,
  ): Promise<{ message: string }> {
    return this.examService.updateQuestionListInExam(id, dto);
  }
}
