import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{ message: string; user: Omit<User, 'password_hash'> }> {
    const { message, user } = await this.userService.create(createUserDto);

    const { password_hash, ...result } = user;
    return { message, user: result };
  }

  @Get('users')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('user/:id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Delete('user/:id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(id);
  }
}
