import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, Types.ObjectId> {
  constructor(
    @InjectModel(Post.name)
    private postsModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {
  }

  async execute({ dto }: CreatePostCommand): Promise<Types.ObjectId> {
    console.log('❤️ Execute');
    const post = await this.blogsRepository.findOrNotFoundFail(new Types.ObjectId(dto.blogId));
    console.log({ post });
    const newPostData = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: post.name,
      // createdAt: new Date().toISOString()
    };

    const entity = this.postsModel.createInstance(newPostData);

    // расскоментировать, чтобы увидеть, что там, где мы кидаем команду,
    // мы можем отловить ошибку, необработанную здесь
    // throw new Error('oops;');

    await this.postsRepository.save(entity);

    return entity._id;
  }
}
