import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './interfaces/exam.interface';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  create(@Body() dto: CreateExamDto): Promise<{ message: string; exam: Exam }> {
    return this.examService.create(dto);
  }

  @Get()
  findAll(): Promise<Exam[]> {
    return this.examService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Exam> {
    return this.examService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExamDto): Promise<Exam> {
    return this.examService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.examService.remove(id);
  }
}
