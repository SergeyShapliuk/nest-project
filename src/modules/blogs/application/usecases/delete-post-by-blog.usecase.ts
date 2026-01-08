import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class DeletePostByBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {
  }
}

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogUseCase
  implements ICommandHandler<DeletePostByBlogCommand, void> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {
  }

  async execute({ blogId, postId }: DeletePostByBlogCommand): Promise<void> {
    // Проверяем существование блога
    await this.blogsRepository.findOrNotFoundFail(blogId);
    // Получаем пост и проверяем, что он принадлежит блогу
    const post = await this.postsRepository.findOrNotFoundFail(postId);

    if (post.blogId !== blogId) {
      throw new NotFoundException('Post not found in this blog');
    }

    // Удаляем пост (мягкое удаление)
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
