import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdatePostByBlogInputDto } from '../../api/input-dto/update-post-by-blog.input-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostByBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public dto: UpdatePostByBlogInputDto,
  ) {
  }
}

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogUseCase
  implements ICommandHandler<UpdatePostByBlogCommand, void> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository) {
  }

  async execute({ blogId, postId, dto }: UpdatePostByBlogCommand): Promise<void> {
    await this.blogsRepository.findOrNotFoundFail(blogId);
    // Получаем пост и проверяем, что он принадлежит блогу
    const post = await this.postsRepository.findOrNotFoundFail(postId);

    if (post.blogId !== blogId) {
      throw new NotFoundException('Post not found in this blog');
      // throw new DomainException({
      //   code: DomainExceptionCode.NotFound,
      //   message: 'Post not found in this blog',
      //   field: 'blogs',
      // });
    }

    post.updatePost({ ...dto, blogId });

    await this.postsRepository.save(post);
  }
}
