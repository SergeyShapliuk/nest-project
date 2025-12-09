import { UpdateUserDto } from '../../dto/update-user.dto';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class UpdateUserInputDto implements UpdateUserDto {
  @IsString()
  @IsEmail()
  // @Matches(emailConstraints.match)
  @Trim()
  email: string;
}
