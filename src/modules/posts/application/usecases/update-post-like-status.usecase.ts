import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsLikeRepository } from '../../infrastructure/posts.like.repository';


export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: { likeStatus: 'None' | 'Like' | 'Dislike' },
    public postId: string,
    public userId: string | undefined,
  ) {
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void> {
  constructor(
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private postsLikeRepository: PostsLikeRepository,
  ) {
  }

  async execute({ dto, postId, userId }: UpdatePostLikeStatusCommand): Promise<void> {
    await this.postsRepository.findOrNotFoundFail(postId);
    const user = await this.usersRepository.findOrNotFoundFail(userId?.toString() || '');

    await this.postsLikeRepository.updateLikeStatus(postId.toString(), userId?.toString() || 'unknown', user.login || 'unknown', dto.likeStatus);
    // const entity = await this.postsRepository.findOrNotFoundFail(postId);
    //
    // entity.updatePost(dto);
    //
    // await this.postsRepository.save(entity);
  }
}
