import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ExamStatus } from '../interfaces/exam.interface';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsNotEmpty()
  start_time: Date;

  @IsNumber()
  @IsNotEmpty()
  duration_minutes: number;

  @IsEnum(ExamStatus)
  @IsNotEmpty()
  status: ExamStatus;

  @IsUUID()
  @IsNotEmpty()
  created_by_id: string;
}
