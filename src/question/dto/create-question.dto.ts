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

export class OptionDto {
  @IsString()
  @IsNotEmpty()
  option_text: string;

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsNumber()
  @IsNotEmpty()
  question_type: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}
