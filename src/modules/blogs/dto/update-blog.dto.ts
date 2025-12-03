import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto implements CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}
