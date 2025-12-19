import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQwRepository } from '../../infrastructure/query/blogs.query.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsByBlogIdQueryRepository } from '../../../posts/infrastructure/query/posts.by.blog.id.query.repository';
import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';

export class GetPostsBlogByIdQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public id: string,
    public userId: string | undefined,
  ) {
  }
}

@QueryHandler(GetPostsBlogByIdQuery)
export class GetPostsBlogByIdQueryHandler
  implements IQueryHandler<GetPostsBlogByIdQuery, PaginatedViewDto<PostViewDto[]>> {
  constructor(
    @Inject(PostsByBlogIdQueryRepository)
    private readonly postsByBlogIdQueryRepository: PostsByBlogIdQueryRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {
  }

  async execute(query: GetPostsBlogByIdQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    console.log('GetBlogByIdQueryHandler', query);
    await this.blogsRepository.findOrNotFoundFail(new Types.ObjectId(query.id));

    return this.postsByBlogIdQueryRepository.getPostsByBlogId(query.queryParams, query.id, query.userId);
  }
}
