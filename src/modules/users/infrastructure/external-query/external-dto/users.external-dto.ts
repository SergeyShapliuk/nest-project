import { User } from '../../../domain/user.entity';

export class UserExternalDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  // emailConfirmation: {
  //   confirmationCode: string;
  //   expirationDate: string;
  //   isConfirmed: boolean;
  // };

  static mapToView(user: User): UserExternalDto {
    const dto = new UserExternalDto();

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
