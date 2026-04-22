import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.userService.bulkCreate(file.buffer);
  }

  @Post('user')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{ message: string; user: Omit<User, 'passwordHash'> }> {
    const { message, user } = await this.userService.create(createUserDto);

    const { passwordHash, ...result } = user;
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
