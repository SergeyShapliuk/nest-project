import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/query/game.query.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';


export class GetMyCurrentGameQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetMyCurrentGameQuery)
export class GetMyCurrentGameHandler
  implements IQueryHandler<GetMyCurrentGameQuery>
{
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
  ) {}

  async execute(query: GetMyCurrentGameQuery) {
    const result = await this.gameQueryRepository.findCurrentGame(
      query.userId,
    );
    if(!result){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No active pair for current user',
      });
    }
    return result
  }
}
