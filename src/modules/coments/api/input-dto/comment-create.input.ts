import { IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CommentCreateInputDto {
  @IsString()
  // @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  content: string;
}
