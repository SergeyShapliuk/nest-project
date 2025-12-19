import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQwRepository } from '../../infrastructure/query/users.query.repository';

import { Types } from 'mongoose';

export class GetUserByIdQuery {
  constructor(public userId: Types.ObjectId) {
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery> {
  constructor(private usersQueryRepository: UsersQwRepository) {
  }

  async execute(query: GetUserByIdQuery) {
    return this.usersQueryRepository.getByIdOrNotFoundFail(query.userId);
  }
}
