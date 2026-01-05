import { User } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  // emailConfirmation: {
  //   confirmationCode: string;
  //   expirationDate: string;
  //   isConfirmed: boolean;
  // };

  static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id; // вместо _id
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    // dto.emailConfirmation = {
    //   confirmationCode: user.emailConfirmation.confirmationCode,
    //   expirationDate: user.emailConfirmation.expirationDate.toISOString(),
    //   isConfirmed: user.emailConfirmation.isConfirmed,
    // };

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: User): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user.id; // вместо _id

    return dto;
  }
}
