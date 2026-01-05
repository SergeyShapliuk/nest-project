import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import type { PostModelType } from '../../domain/post.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsLikeRepository } from '../../infrastructure/posts.like.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../../../coments/domain/comment.entity';
import { Post } from '../../domain/post.entity';


export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: { likeStatus: 'None' | 'Like' | 'Dislike' },
    public postId: Types.ObjectId,
    public userId: Types.ObjectId | undefined,
  ) {
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void> {
  constructor(
    @InjectModel(Post.name) private postsModel: PostModelType,
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
