import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { UserService } from '../user.service';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: DeleteUserCommand) {
    return this.userService.remove(command.id);
  }
}