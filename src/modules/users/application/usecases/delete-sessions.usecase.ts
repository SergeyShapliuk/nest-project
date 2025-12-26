import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { SessionRepository } from '../../infrastructure/session.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteSessionsCommand {
  constructor(
    public userId: string | undefined,
    public deviceId: string | undefined,
  ) {
  }
}

@CommandHandler(DeleteSessionsCommand)
export class DeleteSessionsUseCase
  implements ICommandHandler<DeleteSessionsCommand, void> {
  constructor(private sessionRepository: SessionRepository) {
  }

  async execute({ userId, deviceId }: DeleteSessionsCommand): Promise<void> {
    if (!userId || !deviceId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Access denied',
        field: 'unknown',
      });
    }
    await this.sessionRepository.deleteSessions(userId, deviceId);
  }
}
