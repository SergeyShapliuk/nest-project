import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameQueryRepository } from '../../infrastructure/query/game.query.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';


export class JoinGameCommand {
  constructor(public readonly userId: string) {
  }
}

@CommandHandler(JoinGameCommand)
export class JoinGameUseCase
  implements ICommandHandler<JoinGameCommand> {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    // @InjectRepository(GamePlayerProgress)
    // private readonly progressRepo: Repository<GamePlayerProgress>,
    // @InjectRepository(Player)
    // private readonly playerRepo: Repository<Player>,
    // @InjectRepository(Question)
    // private readonly questionRepo: Repository<Question>,
  ) {
  }

  async execute(command: JoinGameCommand) {
    const { userId } = command;
    console.log('userId', userId);

    // 1️⃣ создаём или присоединяем к игре
    const game = await this.gameRepository.join(userId);

    // 2️⃣ читаем через query repository с relations
    const fullGame = await this.gameQueryRepository.findById(
      game.id,
      userId,
    );

    if (!fullGame) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found after join',
      });
    }

    // 3️⃣ возвращаем DTO в формате, который тебе нужен
    return fullGame;
  }
}

