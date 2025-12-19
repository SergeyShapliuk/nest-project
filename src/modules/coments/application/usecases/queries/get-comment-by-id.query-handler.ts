import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentViewDto } from '../../../api/view-dto/comments.view-dto';
import { CommentsQwRepository } from '../../../inftastructure/query/comments.query.repository';
import { CommentRepository } from '../../../inftastructure/comment.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetCommentByIdQuery {
  constructor(
    public id: Types.ObjectId,
    public userId: Types.ObjectId | null,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentBlogByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewDto>
{
  constructor(
    @Inject(CommentsQwRepository)
    private readonly commentsQwRepository: CommentsQwRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(query: GetCommentByIdQuery): Promise<CommentViewDto> {
    const comment = await this.commentRepository.findByIdOrFail(query.id);

      if (!comment) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Comment not found',
        });
      }

    return this.commentsQwRepository.getByIdOrNotFoundFail(query.id);
  }
}
