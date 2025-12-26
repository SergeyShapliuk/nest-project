import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionService } from '../../application/services/session.service';

export interface IdType {
  id: string;
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,
    private readonly sessionDeviceService: SessionService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const { id: userId, deviceId } = payload as { id: string; deviceId: string };
      console.log('asdasdasd', userId, deviceId, refreshToken);
      console.log('asdasdasd', { payload });
      if (!userId || !deviceId) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const session = await this.sessionDeviceService.validateToken(userId, deviceId, refreshToken);
      console.log('asdasdasd', { session });
      if (!session) {
        throw new UnauthorizedException('Refresh token invalid or session expired');
      }

      req.user = { id: userId } as IdType;
      req.device = { id: deviceId } as IdType;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
