import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentViewDto } from '../../../coments/api/view-dto/comments.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsQwRepository } from '../../../coments/inftastructure/query/comments.query.repository';
import { GetCommentQueryParams } from '../../../coments/api/input-dto/comment-query.input';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class GetCommentsByPostIdQuery {
  constructor(
    public queryParams: GetCommentQueryParams,
    public postId: Types.ObjectId,
    public userId: Types.ObjectId | undefined,
  ) {
  }
}

@QueryHandler(GetCommentsByPostIdQuery)
export class GetCommentsByPostIdHandler
  implements IQueryHandler<GetCommentsByPostIdQuery, PaginatedViewDto<CommentViewDto[]>> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsQwRepository: CommentsQwRepository,
  ) {
  }

  async execute(query: GetCommentsByPostIdQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    console.log('GetBlogByIdQueryHandler', query);
    await this.postsRepository.findOrNotFoundFail(query.postId);

    return this.commentsQwRepository.getAll(query.queryParams, query.postId.toString());
  }
}
