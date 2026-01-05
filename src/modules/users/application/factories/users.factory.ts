import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../services/crypto.service';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersFactory {
  constructor(
    private readonly cryptoService: CryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await this.createPasswordHash(dto.password);
    return this.createUserInstance(dto, passwordHash);
  }

  private async createPasswordHash(password: string): Promise<string> {
    return this.cryptoService.createPasswordHash(password);
  }

  private createUserInstance(
    dto: CreateUserDto,
    passwordHash: string,
  ): User {
    const user = new User();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = passwordHash;

    // user.emailConfirmation = {
    //   confirmationCode: 'code',
    //   expirationDate: new Date(),
    //   isConfirmed: false,
    // };

    return user;
  }
}
