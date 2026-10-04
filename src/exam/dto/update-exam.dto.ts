import { IsArray, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  start_time?: Date;

  @IsOptional()
  @IsNumber()
  duration_minutes?: number;
}

export class UpdateQuestionsFromExamDto {
  @IsArray()
  @IsString({ each: true })
  question_ids: string[];

  @IsOptional()
  @IsNumber()
  status?: number;
}