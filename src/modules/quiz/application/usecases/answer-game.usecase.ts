import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerViewDto } from '../../api/view-dto/quiz.answer.view-dto';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Answer } from '../../domain/entities/answer.entity';
import { PlayerProgress } from '../../domain/entities/game-player-progress.entity';
import { Game } from '../../domain/entities/game.entity';

export class AnswerGameCommand {
  constructor(
    public readonly userId: string,
    public readonly answer: string,
  ) {
  }
}

@CommandHandler(AnswerGameCommand)
export class AnswerGameUseCase implements ICommandHandler<AnswerGameCommand> {
  constructor(
    // private readonly gameRepository: GameRepository,
    private readonly repo: GameRepository,
    private readonly dataSource: DataSource,
  ) {
  }

  // async execute(command: AnswerGameCommand) {
  //   const { userId, answer } = command;
  //
  //   // 1️⃣ Найти активную игру
  //   const game = await this.gameRepository.findActiveByUser(userId);
  //
  //   if (!game) {
  //     throw new ForbiddenException();
  //   }
  //
  //   // 2️⃣ Найти игрока
  //   const player = game.players.find(
  //     p => p.user.id === userId,
  //   );
  //
  //   if (!player) {
  //     throw new ForbiddenException();
  //   }
  //
  //   // 3️⃣ Получить следующий вопрос
  //   const question =
  //     game.getNextQuestion(player.id);
  //
  //   if (!question) {
  //     throw new ForbiddenException();
  //   }
  //
  //   // 4️⃣ Ответить
  //   const createdAnswer = game.submitAnswer(
  //     player.id,
  //     answer,
  //   );
  //
  //   // 5️⃣ Сохранить игру
  //   await this.gameRepository.save(game);
  //
  //   return AnswerViewDto.map(createdAnswer);
  // }
  async execute(command: AnswerGameCommand) {
    return this.dataSource.transaction(async (manager) => {
      const game =
        await this.repo.findActiveByUser(command.userId);

      if (!game) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'Game not found',
        });
      }

      const player = game.players.find(
        p => p.user.id === command.userId,
      );

      if (!player) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'Player not in game',
        });
      }
      const answer = game.submitAnswer(
        player.id,
        command.answer,
      );
      console.log("answer",answer)
      console.log("player.id",player.id)
      console.log("command.answer",command)
      await manager.getRepository(Answer).save(answer); // обязательно сохраняем сам ответ
      player.answers.push(answer);
      await manager.getRepository(PlayerProgress).save(player); // сохраняем прогресс игрока
      await manager.getRepository(Game).save(game); // сохраняем игру (статус, даты)
      const refreshedGame = await this.repo.findActiveByUser(command.userId);
      console.log('refreshedGame firstPlayerProgress.answers:', refreshedGame?.firstPlayer.answers);
      return {
        questionId: answer.question.id,
        answerStatus: answer.status,
        addedAt: answer.addedAt,
        // answerId: answer.id, // теперь id точно будет
      };
    });
  }
}
