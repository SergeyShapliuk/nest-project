import { IsString, Length, Matches } from 'class-validator';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateBlogInputDto implements CreateBlogDto {
  @IsString({ message: 'name must be a string' })
  @Length(1, 15, { message: 'name must be between 1 and 15 characters' })
  @Trim()
  name: string;

  @IsString({ message: 'description must be a string' })
  @Length(1, 500, { message: 'description must be between 1 and 500 characters' })
  @Trim()
  description: string;

  @IsString({ message: 'websiteUrl must be a string' })
  @Length(1, 100, { message: 'websiteUrl must be between 1 and 100 characters' })
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    { message: 'Invalid URL format' },
  )
  @Trim()
  websiteUrl: string;
}
