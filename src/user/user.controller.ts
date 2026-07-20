import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { CreateUserCommand } from './commands/create-user.command';
import { BulkCreateUsersCommand } from './commands/bulk-create-users.command';
import { DeleteUserCommand } from './commands/delete-user.command';
import { GetUsersQuery } from './queries/get-users.query';
import { GetUserQuery } from './queries/get-user.query';

@Controller()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('users/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.commandBus.execute(new BulkCreateUsersCommand(file.buffer));
  }

  @Post('user')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: Omit<User, 'passwordHash'> }> {
    const { message, user } = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );
    const { passwordHash, ...result } = user;
    return { message, user: result };
  }

  @Get('users')
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<User[]> {
    return this.queryBus.execute(
      new GetUsersQuery({ pageNumber, pageSize }),
    );
  }

  @Get('user/:id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Delete('user/:id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
