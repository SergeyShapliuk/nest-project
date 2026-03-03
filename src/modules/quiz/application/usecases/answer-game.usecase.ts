import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { AnswerViewDto } from '../../api/view-dto/quiz.answer.view-dto';

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
    private readonly gameRepository: GameRepository,
  ) {
  }

  async execute(command: AnswerGameCommand) {
    const { userId, answer } = command;

    // 1️⃣ Найти активную игру
    const game = await this.gameRepository.findActiveGameByUser(userId);

    if (!game) {
      throw new ForbiddenException();
    }

    // 2️⃣ Найти игрока
    const player = game.players.find(
      p => p.user.id === userId,
    );

    if (!player) {
      throw new ForbiddenException();
    }

    // 3️⃣ Получить следующий вопрос
    const question =
      game.getNextQuestionForPlayer(player.id);

    if (!question) {
      throw new ForbiddenException();
    }

    // 4️⃣ Ответить
    const createdAnswer = game.answerQuestion(
      player,
      question,
      answer,
    );

    // 5️⃣ Сохранить игру
    await this.gameRepository.save(game);

    return AnswerViewDto.map(createdAnswer);
  }
}
