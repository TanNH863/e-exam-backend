import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { QuestionType } from '../interfaces/question.interface';

export class CreateQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  exam_id: string;

  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  question_type: QuestionType;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}
