import { PlayerProgressViewDto } from './quiz.player.progress.view-dto';
import { GameStatus } from '../../domain/enums/game-status.enum';
import { QuestionViewDto } from './quiz.question.view-dto';
import { Game } from '../../domain/entities/game.entity';

export class GameViewDto {
  id: string;

  firstPlayerProgress: PlayerProgressViewDto;

  secondPlayerProgress: PlayerProgressViewDto | null;

  questions: { id: string, body: string }[] | null;

  status: GameStatus;

  pairCreatedDate: string;

  startGameDate: string | null;

  finishGameDate: string | null;

  static map(game: Game): GameViewDto {
    const dto = new GameViewDto();

    dto.id = game.id;
    dto.status = game.status;

    dto.pairCreatedDate = game.createdAt.toISOString();
    dto.startGameDate = game.startGameDate
      ? game.startGameDate.toISOString()
      : null;

    dto.finishGameDate = game.finishGameDate
      ? game.finishGameDate.toISOString()
      : null;

    dto.firstPlayerProgress =
      PlayerProgressViewDto.map(game.firstPlayer);

    dto.secondPlayerProgress = game.secondPlayer
      ? PlayerProgressViewDto.map(game.secondPlayer)
      : null;

    dto.questions =
      game.status === GameStatus.PENDING_SECOND_PLAYER
        ? null
        : game.questions?.map((q) => ({
          id: q.question.id,
          body: q.question.body,
        }),
      ) ?? null;

    return dto;
  }
}
