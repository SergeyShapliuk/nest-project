import { UpdateUserDto } from '../../dto/update-user.dto';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { passwordConstraints } from '../../domain/user.entity';

export class NewPasswordUserInputDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  recoveryCode: string;
}
