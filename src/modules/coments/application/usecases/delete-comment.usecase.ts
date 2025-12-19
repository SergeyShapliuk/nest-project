import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentRepository } from '../../inftastructure/comment.repository';
import { ForbiddenException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(public id: Types.ObjectId,
              public userId: Types.ObjectId) {
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void> {
  constructor(private commentRepository: CommentRepository) {
  }

  async execute({ id, userId }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentRepository.findByIdOrFail(id);

    if (comment.commentatorInfo.userId !== userId?.toString()) {
      throw new ForbiddenException(
        'If try delete the comment that is not your own',
      );
    }

    comment.makeDeleted();

    await this.commentRepository.save(comment);
  }
}
