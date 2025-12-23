import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './interfaces/question.interface';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<Question> {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  findAll(): Promise<Question[]> {
    return this.questionService.findAll();
  }

  @Get()
  findAllByExam(@Query('examId') examId: string): Promise<Question[]> {
    return this.questionService.findAllByExam(examId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Question> {
    return this.questionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.questionService.remove(id);
  }
}
