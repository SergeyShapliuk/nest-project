import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public id: Types.ObjectId) {
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void> {
  constructor(private postsRepository: PostsRepository) {
  }

  async execute({ id }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
