import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQwRepository } from '../../infrastructure/query/blogs.query.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersExternalQueryRepository } from '../../../users/infrastructure/external-query/users.external-query-repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class GetBlogByIdQuery {
  constructor(
    public id: Types.ObjectId,
    public userId: Types.ObjectId | null,
  ) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler
  implements IQueryHandler<GetBlogByIdQuery, BlogViewDto>
{
  constructor(
    @Inject(BlogsQwRepository)
    private readonly blogsQueryRepository: BlogsQwRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(query: GetBlogByIdQuery): Promise<BlogViewDto> {
    console.log('GetBlogByIdQueryHandler',query)
    const blog = await this.blogsRepository.findOrNotFoundFail(query.id);
    // if (blog.ageRestriction === AgeRestriction.Age18Plus) {
    //   if (!query.userId) {
    //     throw new DomainException({
    //       code: DomainExceptionCode.Forbidden,
    //       message: 'Too yang',
    //     });
    //   }
      if (!blog) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Blog not found',
        });
      }

      //The user's age can be contained in the token
      // const user = await this.usersQueryRepository.getByIdOrNotFoundFail(
      //   query.userId,
      // );

      // if (user.age < 18) {
      //   throw new DomainException({
      //     code: DomainExceptionCode.Forbidden,
      //     message: 'Too yang',
      //   });
      // }
    // }

    return this.blogsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
