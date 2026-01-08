import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId?: string;
}
