import { IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { CommentCreateInputDto } from './comment-create.input';

export class CommentUpdateInputDto implements CommentCreateInputDto {
  // @IsString()
  // id: string;

  @IsString()
  // @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  content: string;

}
