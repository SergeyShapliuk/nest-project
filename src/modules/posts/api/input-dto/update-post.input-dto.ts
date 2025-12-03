import { CreatePostInputDto } from './posts.input-dto';
import { IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class UpdatePostInputDto {
  @IsString()
  title: string;

  @IsString()
  // @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  shortDescription: string;

  @IsString()
  // @IsEmail()
  // @Matches(emailConstraints.match)
  @Trim()
  content: string;

  @IsString()
  // @IsEmail()
  // @Matches(emailConstraints.match)
  @Trim()
  blogId: string;
}
