import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { PostsQwRepository } from '../../../posts/infrastructure/query/posts.query.repository';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

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
  ) {
  }

  async execute({ dto }: CreatePostByBlogIdCommand): Promise<PostViewDto> {
    console.log('❤️ Execute');
    const createPostByBlogId = await this.postsRepository.create(dto);


    return this.postsQwRepository.getByIdOrNotFoundFail(createPostByBlogId.id, '');
  }
}
