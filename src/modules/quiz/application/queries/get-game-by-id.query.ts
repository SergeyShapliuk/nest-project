import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/query/game.query.repository';

export class GetGameByIdQuery {
  constructor(
    public readonly gameId: string,
    public readonly userId: string,
  ) {
  }
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdHandler
  implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
  ) {
  }

  async execute(query: GetGameByIdQuery) {
    return await this.gameQueryRepository.findByIdByPair(query.gameId, query.userId);
  }
}
