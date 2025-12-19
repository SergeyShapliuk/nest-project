import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsQwRepository } from '../../infrastructure/query/posts.query.repository';

export class GetPostsQuery {
  constructor(public queryParams: GetPostsQueryParams) {
  }
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]>> {
  constructor(
    @Inject(PostsQwRepository)
    private readonly postsQwRepository: PostsQwRepository,
  ) {
  }

  async execute(
    query: GetPostsQuery,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQwRepository.getAll(query.queryParams);
  }
}
