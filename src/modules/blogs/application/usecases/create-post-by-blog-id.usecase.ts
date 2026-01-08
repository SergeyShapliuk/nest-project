import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { PostsQwRepository } from '../../../posts/infrastructure/query/posts.query.repository';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class CreatePostByBlogIdCommand {
  constructor(public dto: CreatePostDto) {
  }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand, PostViewDto> {
  constructor(
    private postsQwRepository: PostsQwRepository,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {
  }

  async execute({ dto }: CreatePostByBlogIdCommand): Promise<PostViewDto> {
    console.log('❤️ Execute');
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with id ${dto.blogId} not found`);
    }
    const createPostByBlogId = await this.postsRepository.create(dto);


    return this.postsQwRepository.getByIdOrNotFoundFail(createPostByBlogId.id, '');
  }
}
