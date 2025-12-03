import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserService } from './application/user.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQwRepository } from './infrastructure/query/users.query.repository';
import { User, UserSchema } from './domain/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    UserService, UsersRepository, UsersQwRepository,
  ],
})
export class UserModule {
}
