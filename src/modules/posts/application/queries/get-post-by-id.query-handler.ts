import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQwRepository } from '../../infrastructure/query/posts.query.repository';

export class GetPostByIdQuery {
  constructor(
    public id: string,
    public userId: string | undefined,
  ) {
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto> {
  constructor(
    @Inject(PostsQwRepository)
    private readonly postsQwRepository: PostsQwRepository,
    // private readonly blogsRepository: SessionRepository,
  ) {
  }

  async execute(query: GetPostByIdQuery): Promise<PostViewDto> {
    console.log('GetBlogByIdQueryHandler', query);

    return this.postsQwRepository.getByIdOrNotFoundFail(query.id, query.userId);
  }
}
