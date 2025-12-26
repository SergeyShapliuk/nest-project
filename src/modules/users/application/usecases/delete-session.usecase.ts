import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { SessionRepository } from '../../infrastructure/session.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteSessionCommand {
  constructor(
    public userId: string | undefined,
    public deviceId: string
  ) {
  }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand, void> {
  constructor(private sessionRepository: SessionRepository) {
  }

  async execute({ userId, deviceId }: DeleteSessionCommand): Promise<void> {
    const session = await this.sessionRepository.findOrNotFoundFail(deviceId);
    if (session.userId.toString() !== userId?.toString()) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Access denied',
        field: 'unknown',
      });
    }
    session.makeDeleted();

    await this.sessionRepository.save(session);
  }
}
