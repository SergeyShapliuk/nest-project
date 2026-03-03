import { IsDefined, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';


export class AnswerInputDto {
  @IsDefined({ message: 'answer is required' })
  @IsString({ message: 'answer must be a string' })
  // @Length(10, 500, { message: 'answer must be between 10 and 500 characters' })
  @Trim()
  answer: string;
}
