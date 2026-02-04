import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';
import { UsersFactory } from '../../factories/users.factory';
import { randomUUID } from 'crypto';
import { EmailService } from '../../../../notifications/email.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {
  }
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private emailService: EmailService,
  ) {
  }

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    try {
      const userWithTheSameLogin = await this.usersRepository.findByLogin(
        dto.login,
      );
      const userWithTheSameEmail = await this.usersRepository.findByEmail(
        dto.email,
      );
      console.log({ userWithTheSameLogin });
      console.log({ userWithTheSameEmail });
      if (!!userWithTheSameLogin) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with the same login already exists',
          field: 'login',
        });
      }
      if (!!userWithTheSameEmail) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with the same email already exists',
          field: 'email',
        });
      }

      const user = await this.usersFactory.create(dto);

      const confirmCode = randomUUID();
      const newExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
      user.setCode(confirmCode, newExpirationDate);
      // ивенты могут возвращаться из метода сущности
      //const events = user.setConfirmationCode(confirmCode);
      await this.usersRepository.save(user);
      await this.emailService
        .sendConfirmationEmail(user.email, confirmCode)
        .catch(console.error);

      // this.eventBus.publish(new UserRegisteredEvent(user.email, confirmCode));
      // а могут просто накапливаться в сущности и в конце мы можем у неё
      // попросить данные ивенты, чтиобы опубликовать их
      // this.eventBus.publish(user.getEvents());
    } catch (e) {
      // transaction.rollback();
      throw e;
    }
  }
}
