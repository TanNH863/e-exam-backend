import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from '../database.module';
import { CreateUserHandler } from './handlers/create-user.handler';
import { BulkCreateUsersHandler } from './handlers/bulk-create-users.handler';
import { DeleteUserHandler } from './handlers/delete-user.handler';
import { GetUserHandler } from './handlers/get-user.handler';
import { GetUsersHandler } from './handlers/get-users.handler';

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserHandler,
    BulkCreateUsersHandler,
    DeleteUserHandler,
    GetUserHandler,
    GetUsersHandler,
  ],
})
export class UserModule {}
