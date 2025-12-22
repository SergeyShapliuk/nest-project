import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { CommentCreateInputDto } from './comment-create.input';

export class CommentUpdateInputDto implements CommentCreateInputDto {
  @IsString({ message: 'content must be a string' })
  @Length(20, 300, { message: 'content must be between 20 and 300 characters' })
  @Trim()
  content: string;
}
