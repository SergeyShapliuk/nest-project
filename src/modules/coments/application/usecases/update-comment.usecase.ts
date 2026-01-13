import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ForbiddenException } from '@nestjs/common';
import { CommentRepository } from '../../inftastructure/comment.repository';

export class UpdateCommentCommand {
  constructor(
    public id: string,
    public userId: string | undefined,
    public dto: UpdateCommentDto,
  ) {
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void> {
  constructor(private commentRepository: CommentRepository) {
  }

  async execute({ id, userId, dto }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentRepository.findByIdOrFail(id);

    if (comment.commentatorInfo.userId.toString() !== userId?.toString()) {
      throw new ForbiddenException(
        'If try update the comment that is not your own',
      );
    }

    comment.updateComment(dto.content);

    await this.commentRepository.save(comment);
  }
}
