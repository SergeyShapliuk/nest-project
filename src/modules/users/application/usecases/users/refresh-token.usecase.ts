import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenBlackListService } from '../../services/refreshTokenBlacklistService';
import { AuthService } from '../../services/auth.service';

export class RefreshTokenCommand {
  constructor(
    public userId: string | undefined,
    public deviceId: string | undefined,
    public oldRefreshToken: string,
  ) {
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, { accessToken: string, refreshToken: string }> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private authService: AuthService,
    private refreshTokenBlackListService: RefreshTokenBlackListService) {
  }

  async execute({
                  userId,
                  deviceId,
                  oldRefreshToken,
                }: RefreshTokenCommand): Promise<{ accessToken: string, refreshToken: string }> {
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
    console.log('else')
    const tokens = await this.authService.refreshTokens(userId, oldRefreshToken);
    if (!tokens) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access denied',
        field: 'tokens',
      });
    }
    const { accessToken, refreshToken } = tokens;
    return { accessToken, refreshToken };
  }
}
