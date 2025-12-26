import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';
import { SessionsQwRepository } from '../../infrastructure/query/sessions.query.repository';

export class GetSessionsQuery {
  constructor(public userId: string | undefined) {
  }
}

@QueryHandler(GetSessionsQuery)
export class GetSessionsQueryHandler
  implements IQueryHandler<GetSessionsQuery, SessionsViewDto[]> {
  constructor(
    @Inject(SessionsQwRepository)
    private readonly sessionsQwRepository: SessionsQwRepository,
  ) {
  }

  async execute({ userId }: GetSessionsQuery): Promise<SessionsViewDto[]> {
    return this.sessionsQwRepository.getAll(userId);
  }
}
