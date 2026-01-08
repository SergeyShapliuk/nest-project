import { IsDefined, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { UpdatePostByBlogDomainDto } from '../../../posts/domain/dto/update-post-by-blog.domain.dto';

export class UpdatePostByBlogInputDto implements UpdatePostByBlogDomainDto {
  @IsDefined({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  @Length(1, 30, { message: 'title must be between 1 and 30 characters' })
  @Trim()
  title: string;

  @IsDefined({ message: 'shortDescription is required' })
  @IsString({ message: 'shortDescription must be a string' })
  @Length(1, 100, { message: 'shortDescription must be between 1 and 100 characters' })
  @Trim()
  shortDescription: string;

  @IsDefined({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  @Length(1, 1000, { message: 'content must be between 1 and 1000 characters' })
  @Trim()
  content: string;
}
