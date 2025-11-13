import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { QuestionType } from '../interfaces/question.interface';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  question_text?: string;

  @IsEnum(QuestionType)
  @IsOptional()
  question_type?: QuestionType;

  @IsNumber()
  @IsOptional()
  order?: number;
}
