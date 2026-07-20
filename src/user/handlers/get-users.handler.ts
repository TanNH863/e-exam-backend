import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../queries/get-users.query';
import { UserService } from '../user.service';
import { User } from '@prisma/client';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUsersQuery): Promise<User[]> {
    const { pageNumber, pageSize } = query.params;
    return this.userService.findAll(pageNumber, pageSize);
  }
}