import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { randomUUID } from 'crypto';
import { EmailService } from '../../../notifications/email.service';
import { Types } from 'mongoose';
import { UserService } from './user.service';
import bcrypt from 'bcrypt';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { SessionRepository } from '../../infrastructure/session.repository';
import { RefreshTokenBlackListService } from './refreshTokenBlacklistService';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private usersRepository: UsersRepository,
    private sessionRepository: SessionRepository,
    private userService: UserService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private refreshTokenBlackListService: RefreshTokenBlackListService,
  ) {
  }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string }> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    console.log('user', user);
    return { id: user.id };
  }

  async confirmCode(code: string) {
    console.log('confirmCode:', { code });
    const user = await this.usersRepository.findByCode(code);
    // const user1 = await this.usersRepository.findByLogin('Sergee');

    console.log('confirmCode:', user);
    // console.log('confirmCode2:', user1);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user not found',
        field: 'code',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user is confirmed',
        field: 'code',
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
        field: 'email',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user is confirmed',
        field: 'email',
      });
    }
    console.log('resendCode:', user);
    const newConfirmationCode = randomUUID();
    const newExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    console.log('newConfirmationCode:', newConfirmationCode);
    user.setCode(newConfirmationCode, newExpirationDate);
    await this.usersRepository.save(user);

    await this.emailService
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

  async refreshTokens(
    userId: string, oldRefreshToken: string,
  ): Promise<{ accessToken: string, refreshToken: string } | null> {
    const oldPayload = await this.refreshTokenContext.decode(oldRefreshToken) as any;
    console.log({ oldPayload });
    if (!oldPayload?.id || !oldPayload?.deviceId) {
      return null;
    }

    // Проверяем существование устройства в БД
    const existingSession = await this.sessionRepository.findById(oldPayload.deviceId);
    console.log({ existingSession });
    if (!existingSession || existingSession.userId !== userId) {
      return null;
    }
    const user = await this.usersRepository.findById(userId);

    if (!user?.id) {
      return null;
    }
    await this.refreshTokenBlackListService.addToBlacklist(oldRefreshToken, userId);
    const accessToken = this.accessTokenContext.sign({
      id: userId,
    });
    const payload = {
      id: userId,
      deviceId: oldPayload.deviceId ?? randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    };

    const refreshToken = this.refreshTokenContext.sign(payload);
    console.log({ accessToken }, { refreshToken });
    if (!accessToken || !refreshToken) {
      return null;
    }
    const newPayload = await this.refreshTokenContext.decode(refreshToken) as any;
    if (!newPayload?.iat || !newPayload?.exp) {
      return null;
    }
    await this.sessionRepository.updateSession(oldPayload.deviceId, {
      lastActiveDate: new Date(newPayload.iat * 1000), // обновляем дату активности
      expiresAt: new Date(newPayload.exp * 1000),       // обновляем срок действия
      // deviceId и userId остаются прежними
    });

    return { accessToken, refreshToken };
  }

}
