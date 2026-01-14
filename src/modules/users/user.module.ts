import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserService } from './application/services/user.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQwRepository } from './infrastructure/query/users.query.repository';
import { User, UserSchema } from './domain/user.entity';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/services/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/services/crypto.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { UsersExternalService } from './application/external/users.external-service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { LocalAuthGuard } from './guards/local/local-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { DeleteUserUseCase } from './application/usecases/admins/delete-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { UsersFactory } from './application/factories/users.factory';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { GetSessionsQueryHandler } from './application/queries/get-sessions.query-handler';
import { Session, SessionSchema } from './domain/session.entity';
import { SessionController } from './api/session.controller';
import { SessionService } from './application/services/session.service';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionsQwRepository } from './infrastructure/query/sessions.query.repository';
import { DeleteSessionUseCase } from './application/usecases/delete-session.usecase';
import { DeleteSessionsUseCase } from './application/usecases/delete-sessions.usecase';
import { RefreshTokenUseCase } from './application/usecases/users/refresh-token.usecase';
import { RefreshTokenBlackListService } from './application/services/refreshTokenBlacklistService';
import { BlackList, BlackListSchema } from './domain/blackListToken.entity';
import { BlackListRepository } from './infrastructure/black-list.repository';
import { LogoutUserUseCase } from './application/usecases/logout-user.usecase';
import { UpdateUserUseCase } from './application/usecases/update-user.usecase';

const commandHandlers = [
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteSessionUseCase,
  DeleteSessionsUseCase,
  RefreshTokenUseCase,
  LogoutUserUseCase,
];

const queryHandlers = [GetUserByIdQueryHandler, GetSessionsQueryHandler];

@Module({
  imports: [
    PassportModule,
    JwtModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }, {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: BlackList.name,
        schema: BlackListSchema,
      }]), NotificationsModule],
  controllers: [UsersController, AuthController, SessionController],
  providers: [...commandHandlers, ...queryHandlers, {
    provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
    useFactory: (): JwtService => {
      return new JwtService({
        secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
        signOptions: { expiresIn: '10s' },
      });
    },
    inject: [
      /*TODO: inject configService. will be in the following lessons*/
    ],
  },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'refresh-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '20s' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    UserService, UsersRepository, UsersQwRepository, AuthQueryRepository, BlackListRepository, AuthService, LocalStrategy, CryptoService, JwtStrategy, UsersExternalQueryRepository, UsersExternalService, RefreshTokenBlackListService, UsersFactory, SessionService, SessionRepository, SessionsQwRepository,
  ],
  exports: [JwtStrategy, UsersExternalQueryRepository, UsersExternalService, UsersRepository],
})
export class UserModule {
}
