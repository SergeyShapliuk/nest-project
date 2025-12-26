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

export class LoginUserCommand {
  constructor(public dto: LoginInputDto,
              public ip: string,           // ← Добавить IP
              public userAgent: string,    // ← Добавить User-Agent
  ) {
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private sessionService: SessionService,
    private authService: AuthService,
  ) {
  }

  async execute(command: LoginUserCommand): Promise<{ accessToken: string, refreshToken: string }> {
    const { dto, ip, userAgent } = command;
    const { id } = await this.authService.validateUser(dto.loginOrEmail, dto.password);

    console.log('id', id.toString());
    const accessToken = this.accessTokenContext.sign({
      id: id.toString(),
    });

    const deviceId = randomUUID();
    const refreshToken = this.refreshTokenContext.sign({
      id: id.toString(),
      deviceId,
    });

    console.log('refreshToken', refreshToken);

    await this.sessionService.createSession(
      id.toString(),
      deviceId,
      // refreshToken,
      ip, // можно получать из req
      userAgent, // можно получать из req
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
