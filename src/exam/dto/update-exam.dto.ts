import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  duration_minutes?: number;
}

export class UpdateQuestionsFromExamDto {
  @IsArray()
  @IsString({ each: true })
  question_ids: string[];

  @IsOptional()
  @IsString()
  status?: string;
}