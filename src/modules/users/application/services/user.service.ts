import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQwRepository } from '../../infrastructure/query/users.query.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../domain/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../../notifications/email.service';
import { CryptoService } from './crypto.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersRepository: UsersRepository,
    private readonly usersQwRepository: UsersQwRepository,
    private readonly emailService: EmailService,
    private readonly cryptoService: CryptoService,
  ) {
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithTheSameLogin = await this.usersRepository.findByLogin(dto.login);
    const userWithTheSameEmail = await this.usersRepository.findByEmail(dto.email);

    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        field: 'login',
      });
    }

    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
        field: 'email',
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(dto.password);

    // создаем новую сущность User
    const user = this.userRepository.create({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    await this.userRepository.save(user);

    return user.id; // UUID вместо _id
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id); // должен работать через TypeORM
    user.makeDeleted();

    await this.userRepository.save(user);
  }
}
