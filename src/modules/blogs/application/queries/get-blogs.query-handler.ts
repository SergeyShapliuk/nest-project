import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQwRepository } from '../../infrastructure/query/blogs.query.repository';

export class GetBlogsQuery {
  constructor(public queryParams: GetBlogsQueryParams) {
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler
  implements IQueryHandler<GetBlogsQuery, PaginatedViewDto<BlogViewDto[]>> {
  constructor(
    @Inject(BlogsQwRepository)
    private readonly queryRepository: BlogsQwRepository,
  ) {
  }

  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryRepository.getAll(query.queryParams);
  }
}
