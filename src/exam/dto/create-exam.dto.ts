import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsUUID()
  @IsNotEmpty()
  created_by_id: string;
}
