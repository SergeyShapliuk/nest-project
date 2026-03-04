import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/query/game.query.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameViewDto } from '../../api/view-dto/quiz.view-dto';


export class GetMyCurrentGameQuery {
  constructor(public readonly userId: string) {
  }
}

@QueryHandler(GetMyCurrentGameQuery)
export class GetMyCurrentGameHandler
  implements IQueryHandler<GetMyCurrentGameQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    // private readonly repo: GameRepository,
  ) {
  }

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
  // async execute(query: GetMyCurrentGameQuery) {
  //   const game = await this.repo.findActiveByUser(
  //     query.userId,
  //   );
  //
  //   if (!game) return null;
  //
  //   return GameViewDto.map(game);
  // }
}
