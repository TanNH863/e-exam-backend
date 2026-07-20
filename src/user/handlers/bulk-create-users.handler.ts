import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkCreateUsersCommand } from '../commands/bulk-create-users.command';
import { UserService } from '../user.service';

@CommandHandler(BulkCreateUsersCommand)
export class BulkCreateUsersHandler implements ICommandHandler<BulkCreateUsersCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: BulkCreateUsersCommand) {
    return this.userService.bulkCreate(command.fileBuffer);
  }
}