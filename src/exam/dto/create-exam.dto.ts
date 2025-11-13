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

  @IsNumber()
  @IsNotEmpty()
  duration_minutes: number;

  @IsUUID()
  @IsNotEmpty()
  created_by_id: string;
}
