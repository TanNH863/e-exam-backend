import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../queries/get-user.query';
import { UserService } from '../user.service';
import { User } from '@prisma/client';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserQuery): Promise<User> {
    return this.userService.findOne(query.id);
  }
}