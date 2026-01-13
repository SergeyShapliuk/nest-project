import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikeRepository } from '../../inftastructure/comment.like.repository';
import { CommentRepository } from '../../inftastructure/comment.repository';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId:string,
    public userId: string | undefined,
    public dto: { likeStatus: 'Like' | 'Dislike' | 'None' },
  ) {
  }
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand, void> {
  constructor(private commentLikeRepository: CommentLikeRepository,
              private commentRepository: CommentRepository) {
  }

  async execute({ commentId, userId, dto }: UpdateCommentLikeStatusCommand): Promise<void> {
    await this.commentRepository.findByIdOrFail(commentId);

    await this.commentLikeRepository.updateLikeStatus(
      commentId.toString(),
      userId?.toString() || '',
      dto.likeStatus,
    );
  }
}
