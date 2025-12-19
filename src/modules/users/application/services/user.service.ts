import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQwRepository } from '../../infrastructure/query/users.query.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from '../../../notifications/email.service';
import { CryptoService } from './crypto.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Types } from 'mongoose';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private usersQwRepository: UsersQwRepository,
    private emailService: EmailService,
    private cryptoService: CryptoService,
  ) {
  }

  // async findMany(
  //   queryDto: UserQueryInput,
  // ): Promise<{ items: UserDocument[]; totalCount: number }> {
  //   return this.usersQwRepository.findMany(queryDto);
  // }

  async createUser(dto: CreateUserDto): Promise<string> {

    const userWithTheSameLogin = await this.usersRepository.findByLogin(
      dto.login,
    );
    const userWithTheSameEmail = await this.usersRepository.findByEmail(
      dto.email,
    );

    if (!!userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        field:'login'
      });
    }
    if (!!userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
        field:'email'
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      password: passwordHash,
    });
    console.log('createUser', user);
    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: Types.ObjectId) {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
