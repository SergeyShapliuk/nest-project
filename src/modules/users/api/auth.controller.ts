import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus, Res, Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { AuthService } from '../application/services/auth.service';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Nullable, UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { AUTH_PATH } from '../../../core/paths/paths';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { CodeInputDto } from './input-dto/code.input-dto';
import { NewPasswordUserInputDto } from './input-dto/new-password-user.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';

@Controller(AUTH_PATH)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    // console.log('cookies', request.cookies);
    return this.authQueryRepository.me(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    // return this.authService.registerUser(body);
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  //swagger doc
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    // @Request() req: any
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    console.log('login:', user.id);
    // return this.authService.login(user.id);
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginUserCommand({ userId: user.id }),
    );
    // Устанавливаем refresh token в httpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Не доступен через JavaScript (защита от XSS)
      secure: true,
      sameSite: 'strict', // Защита от CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней в миллисекундах
      path: '/', // Доступен для всех путей или '/auth/refresh' если нужно ограничить
      // domain: '.yourdomain.com', // Если используете поддомены
    });
    return { accessToken };
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  confirmCode(@Body() body: CodeInputDto): Promise<void> {
    return this.authService.confirmCode(body.code);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  resendCode(@Body() body: UpdateUserInputDto): Promise<void> {
    return this.authService.resendCode(body.email);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() body: UpdateUserInputDto): Promise<void> {
    return this.authService.passwordRecovery(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  confirmNwPassword(@Body() body: NewPasswordUserInputDto): Promise<void> {
    return this.authService.passwordConfirm(body.newPassword, body.recoveryCode);
  }

  @ApiBearerAuth()
  @Get('me-or-default')
  @UseGuards(JwtOptionalAuthGuard)
  async meOrDefault(
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<Nullable<MeViewDto>> {
    if (user) {
      return this.authQueryRepository.me(user.id!);
    } else {
      return {
        login: 'anonymous',
        userId: null,
        email: null,

      };
    }
  }
}
