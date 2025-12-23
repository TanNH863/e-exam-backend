import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../interfaces/question.interface';

export class OptionDto {
  @IsString()
  @IsNotEmpty()
  option_text: string;

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}
