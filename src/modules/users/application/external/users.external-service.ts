import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class UsersExternalService {
  constructor(
    //инжектирование модели в сервис через DI
    private usersRepository: UsersRepository,
  ) {
  }

  async makeUserAsSpammer(userId: string) {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    // user.makeSpammer();

    await this.usersRepository.save(user);
  }
}
