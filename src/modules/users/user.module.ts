import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserService } from './application/user.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQwRepository } from './infrastructure/query/users.query.repository';
import { User, UserSchema } from './domain/user.entity';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/crypto.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { UsersExternalService } from './application/users.external-service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { LocalAuthGuard } from './guards/local/local-auth.guard';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
      signOptions: { expiresIn: '60m' }, // Время жизни токена
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), NotificationsModule],
  controllers: [UsersController,AuthController,SecurityDevicesController],
  providers: [
    UserService, UsersRepository, UsersQwRepository, SecurityDevicesQueryRepository, AuthQueryRepository, AuthService,LocalStrategy, CryptoService, JwtStrategy, UsersExternalQueryRepository, UsersExternalService,
  ],
  exports: [JwtStrategy, UsersExternalQueryRepository, UsersExternalService],
})
export class UserModule {
}
