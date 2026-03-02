import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateQuestionPublishInputDto {
  @IsNotEmpty({ message: 'published is required' })
  @IsBoolean({ message: 'published must be a boolean' })
  published: boolean;
}
