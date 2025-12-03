import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UsersQwRepository } from '../infrastructure/query/users.query.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(UsersQwRepository) private usersQwRepository: UsersQwRepository,
  ) {
  }

  // async findMany(
  //   queryDto: UserQueryInput,
  // ): Promise<{ items: UserDocument[]; totalCount: number }> {
  //   return this.usersQwRepository.findMany(queryDto);
  // }

  async createUser(dto: CreateUserDto): Promise<string> {

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const confirmationCode = randomUUID();
    const expirationDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
      confirmationCode,
      expirationDate,
    });
    console.log('createUser', user);
    await this.usersRepository.save(user);

    return user._id.toString();
  }


  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
