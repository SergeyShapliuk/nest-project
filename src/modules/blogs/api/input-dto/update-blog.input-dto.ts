import { CreateBlogInputDto } from './blogs.input-dto';
import { IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class UpdateBlogInputDto implements CreateBlogInputDto {
  @IsString()
  name: string;

  @IsString()
  // @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  description: string;

  @IsString()
  // @IsEmail()
  // @Matches(emailConstraints.match)
  @Trim()
  websiteUrl: string;

}
