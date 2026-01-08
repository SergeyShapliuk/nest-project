import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    console.log('❤️ Execute');

    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);
    console.log({ blog });

    const newPostData = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    };

    // Используем репозиторий для создания поста
    const post = await this.postsRepository.create(newPostData);

    return post.id; // Возвращаем string вместо Types.ObjectId
  }
}
