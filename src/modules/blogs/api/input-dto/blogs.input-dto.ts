import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/blog.entity';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

// Доступные декораторы для валидации
// https://github.com/typestack/class-validator?tab=readme-ov-file#validation-decorators

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateBlogInputDto {
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
