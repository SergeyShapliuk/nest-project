import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameQueryRepository } from '../../infrastructure/query/game.query.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';
import { Game } from '../../domain/entities/game.entity';
import { GameViewDto } from '../../api/view-dto/quiz.view-dto';
import { GameStatus } from '../../domain/enums/game-status.enum';
import { GameQuestion } from '../../domain/entities/game-question.entity';


export class JoinGameCommand {
  constructor(public readonly userId: string) {
  }
}

@CommandHandler(JoinGameCommand)
export class JoinGameUseCase
  implements ICommandHandler<JoinGameCommand> {
  constructor(
    // private readonly gameRepository: GameRepository,
    // private readonly gameQueryRepository: GameQueryRepository,
    private readonly repo: GameRepository,
    private readonly dataSource: DataSource,
    // @InjectRepository(GamePlayerProgress)
    // private readonly progressRepo: Repository<GamePlayerProgress>,
    // @InjectRepository(Player)
    // private readonly playerRepo: Repository<Player>,
    // @InjectRepository(Question)
    // private readonly questionRepo: Repository<Question>,
  ) {
  }

  // async execute(command: JoinGameCommand) {
  //   const { userId } = command;
  //   console.log('userId', userId);
  //
  //   // 1️⃣ создаём или присоединяем к игре
  //   const game = await this.gameRepository.join(userId);
  //
  //   // 2️⃣ читаем через query repository с relations
  //   const fullGame = await this.gameQueryRepository.findById(
  //     game.id,
  //     userId,
  //   );
  //
  //   if (!fullGame) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'Game not found after join',
  //     });
  //   }
  //
  //   // 3️⃣ возвращаем DTO в формате, который тебе нужен
  //   return fullGame;
  // }
  async execute(command: JoinGameCommand) {
    return this.dataSource.transaction(async () => {
      const active =
        await this.repo.findActiveByUser(command.userId);
      console.log('active', active);
      if (active) {
        // return GameViewDto.map(active);

        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'User already participating in active game',
        });
      }

      const pending = await this.repo.findPendingGame();
// console.log({pending})
      const progress =
        await this.repo.createProgress(command.userId);

      if (!pending) {
        const game = new Game();
        game.status = GameStatus.PENDING_SECOND_PLAYER;
        game.firstPlayer = progress;

        const saved = await this.repo.save(game);
        return GameViewDto.map(saved);
      }

      pending.addSecondPlayer(progress);

      const questions =
        await this.repo.getRandomPublishedQuestions(5);
      questions.sort(() => Math.random() - 0.5);
// console.log({questions})
      pending.questions = questions.map((q, i) => {
        const gq = new GameQuestion();
        gq.question = q;
        gq.order = i + 1;
        return gq;
      });

      const saved = await this.repo.save(pending);
      return GameViewDto.map(saved);
    });
  }
}

