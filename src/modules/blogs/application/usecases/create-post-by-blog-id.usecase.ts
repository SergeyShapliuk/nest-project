import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { PostModelType } from '../../../posts/domain/post.entity';
import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { PostsService } from '../../../posts/application/posts.service';
import { PostsQwRepository } from '../../../posts/infrastructure/query/posts.query.repository';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';

export class CreatePostByBlogIdCommand {
  constructor(public dto: CreatePostDto) {
  }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand, PostViewDto> {
  constructor(
    @InjectModel(Blog.name)
    private postModel: PostModelType,
    private postsQwRepository: PostsQwRepository,
    private postsService: PostsService,
  ) {
  }

  async execute({ dto }: CreatePostByBlogIdCommand): Promise<PostViewDto> {
    console.log('❤️ Execute');
    const createPostByBlogId = await this.postsService.createPost(dto);


    return this.postsQwRepository.getByIdOrNotFoundFail(new Types.ObjectId(createPostByBlogId));
  }
}
