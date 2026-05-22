import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
} from 'class-validator';
import { UserRole } from '../interfaces/user.interface';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  prefix: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsNumber()
  @IsNotEmpty()
  role: UserRole;
}
