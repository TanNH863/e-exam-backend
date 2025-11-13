import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password_hash'>> {
    const newUser = await this.userService.create(createUserDto);

    const { password_hash, ...result } = newUser;
    return result;
  }
}
