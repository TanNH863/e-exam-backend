import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  question_text?: string;

  @IsNumber()
  @IsOptional()
  question_type?: number;

  @IsNumber()
  @IsOptional()
  order?: number;
}
