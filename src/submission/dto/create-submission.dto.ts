import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AnswerDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsUUID()
  @IsOptional()
  chosenOptionId?: string;

  @IsArray()
  @IsUUID()
  @IsOptional()
  chosenOptionIds?: string[];

  @IsString()
  @IsOptional()
  shortAnswerText?: string;
}

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @IsNumber()
  @IsOptional()
  status?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];

  @IsBoolean()
  @IsOptional()
  complete?: boolean;
}

// expected request body:
// {
//   "studentId": "uuid",
//   "status": 1,
//   "answers": [
//     {
//       "questionId": "uuid",
//       "chosenOptionId": "uuid",
//       "chosenOptionIds": ["uuid1", "uuid2"],
//       "shortAnswerText": "string"
//     }
//   ],
//   "complete": true
// }