import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { randomUUID } from 'crypto';
import { EmailService } from '../../notifications/email.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Types } from 'mongoose';
import { UserService } from './user.service';
import bcrypt from 'bcrypt';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private userService: UserService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {
  }

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }

  async registerUser(dto: CreateUserDto) {
    const createdUserId = await this.userService.createUser(dto);

    const user = await this.usersRepository.findOrNotFoundFail(
      new Types.ObjectId(createdUserId).toString(),
    );
    console.log('registerUserFind:', user);
    const confirmCode = randomUUID();
    const newExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    console.log('confirmCode:', confirmCode);
    user.setCode(confirmCode, newExpirationDate);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }

  async confirmCode(code: string) {
    console.log('confirmCode:', { code });
    const user = await this.usersRepository.findByCode(code);
    const user1 = await this.usersRepository.findByLogin('Sergee');

    console.log('confirmCode:', user);
    console.log('confirmCode2:', user1);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user not found',
        field:'code'
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user is confirmed',
        field:'email'
      });
    }

    console.log('registerUserFind:', user);

    user.confirmEmail();
    await this.usersRepository.save(user);

  }

  async resendCode(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    console.log('registerUserFind:', user);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user not found',
        // field:'login'
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user is confirmed',
        field:'email'
      });
    }
    console.log('resendCode:', user);
    const newConfirmationCode = randomUUID();
    const newExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    console.log('newConfirmationCode:', newConfirmationCode);
    user.setCode(newConfirmationCode, newExpirationDate);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, newConfirmationCode)
      .catch(console.error);
  }

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    console.log('registerUserFind:', user);
    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    console.log('resendCode:', user);
    const newConfirmationCode = randomUUID();
    const newExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    console.log('newConfirmationCode:', newConfirmationCode);
    user.setCode(newConfirmationCode, newExpirationDate);
    await this.usersRepository.save(user);

    this.emailService
      .sendRecoveryPassword(user.email, newConfirmationCode)
      .catch(console.error);
  }

  async passwordConfirm(password: string, code: string) {
    const user = await this.usersRepository.findByCode(code);
    console.log('registerUserFind:', user);
    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    console.log('resendCode:', user);
    const passwordHash = await bcrypt.hash(password, 10);

    user.setNewPassword(passwordHash);
    await this.usersRepository.save(user);
  }

}
