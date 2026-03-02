import { CreateQuestionInputDto } from './questions.input-dto';
import { ArrayMinSize, IsArray, IsDefined, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class UpdateQuestionInputDto implements CreateQuestionInputDto {
  @IsDefined({ message: 'body is required' })
  @IsString({ message: 'body must be a string' })
  @Length(10, 500, { message: 'body must be between 10 and 500 characters' })
  @Trim()
  body: string;

  @IsArray({ message: 'Correct answers must be an array' })
  @ArrayMinSize(1, { message: 'At least one correct answer is required' })
  @IsString({ each: true, message: 'Each answer must be a string' })
  @IsNotEmpty({ each: true, message: 'Answers cannot be empty strings' })
  correctAnswers: string[];
}
