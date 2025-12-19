import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQwRepository } from '../../infrastructure/query/posts.query.repository';

export class GetPostByIdQuery {
  constructor(
    public id: Types.ObjectId,
    public userId: Types.ObjectId | undefined,
  ) {
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto> {
  constructor(
    @Inject(PostsQwRepository)
    private readonly postsQwRepository: PostsQwRepository,
    // private readonly blogsRepository: BlogsRepository,
  ) {
  }

  async execute(query: GetPostByIdQuery): Promise<PostViewDto> {
    console.log('GetBlogByIdQueryHandler', query);

    return this.postsQwRepository.getByIdOrNotFoundFail(query.id, query.userId);
  }
}
