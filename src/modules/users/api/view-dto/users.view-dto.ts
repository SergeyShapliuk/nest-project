import { UserDocument } from '../../domain/user.entity';


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

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user._id.toString();
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
