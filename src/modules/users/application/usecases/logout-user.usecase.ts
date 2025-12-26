import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { SessionService } from '../services/session.service';
import { LoginInputDto } from '../../api/input-dto/login.input-dto';
import { AuthService } from '../services/auth.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { RefreshTokenBlackListService } from '../services/refreshTokenBlacklistService';
import { SessionRepository } from '../../infrastructure/session.repository';

export class LogoutUserCommand {
  constructor(
    public userId: string | undefined,
    public deviceId: string | undefined,
    public oldRefreshToken: string,
  ) {
  }
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    // @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    // private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    // private sessionService: SessionService,
    // private authService: AuthService,
    private refreshTokenBlackListService: RefreshTokenBlackListService,
    private sessionRepository: SessionRepository,
  ) {
  }

  async execute(command: LogoutUserCommand): Promise<void> {
    const { userId, deviceId, oldRefreshToken } = command;
    if (!userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access denied',
        field: 'userId',
      });
    }
    const isBlackListed = await this.refreshTokenBlackListService.isTokenBlacklisted(oldRefreshToken);
    if (isBlackListed) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access denied',
        field: 'isBlackListed',
      });
    }
    const oldPayload = await this.refreshTokenContext.decode(oldRefreshToken) as any;
    console.log({ oldPayload });
    if (!oldPayload?.id || !oldPayload?.deviceId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access denied',
        field: 'isBlackListed',
      });
    }

    // Проверяем существование устройства в БД
    const existingSession = await this.sessionRepository.findById(oldPayload.deviceId);
    console.log({ existingSession });
    if (!existingSession || existingSession.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access denied',
        field: 'existingSession',
      });
    }
    await this.sessionRepository.deleteSessions(userId, oldPayload.deviceId);
    // await this.refreshTokenBlackListService.addToBlacklist(oldRefreshToken, userId);

  }
}
