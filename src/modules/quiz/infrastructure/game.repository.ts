import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { UsersRepository } from '../../users/infrastructure/users.repository';

import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Game } from '../domain/entities/game.entity';
import { PlayerProgress } from '../domain/entities/game-player-progress.entity';
import { GameQuestion } from '../domain/entities/game-question.entity';
import { Answer } from '../domain/entities/answer.entity';
import { Question } from '../domain/entities/question.entity';
import { GameStatus } from '../domain/enums/game-status.enum';
import { AnswerStatus } from '../domain/enums/answer-status.enum';
import { GameViewDto } from '../api/view-dto/quiz.view-dto';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,

    @InjectRepository(PlayerProgress)
    private readonly progressRepo: Repository<PlayerProgress>,

    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepo: Repository<GameQuestion>,

    @InjectRepository(Answer)
    private readonly answerRepo: Repository<Answer>,

    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,

    private readonly usersRepository: UsersRepository,
  ) {}

  /* ==================== JOIN ==================== */

  async join(userId: string): Promise<GameViewDto> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    // Проверка, чтобы пользователь не был в другой активной игре
    const existingGame = await this.gameRepo
      .createQueryBuilder('g')
      .leftJoin('g.firstPlayer', 'fp')
      .leftJoin('fp.user', 'fpUser')
      .leftJoin('g.secondPlayer', 'sp')
      .leftJoin('sp.user', 'spUser')
      .where('(fpUser.id = :userId OR spUser.id = :userId)', { userId })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GameStatus.PENDING_SECOND_PLAYER, GameStatus.ACTIVE],
      })
      .andWhere('g.deletedAt IS NULL')
      .getOne();

    if (existingGame) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User already in active game',
      });
    }

    const pendingGame = await this.gameRepo.findOne({
      where: {
        status: GameStatus.PENDING_SECOND_PLAYER,
        deletedAt: IsNull(),
      },
      relations: ['firstPlayer', 'firstPlayer.user'],
    });

    if (pendingGame) {
      const secondProgress = await this.progressRepo.save(
        this.progressRepo.create({
          user,
          score: 0,
        }),
      );

      pendingGame.secondPlayer = secondProgress;
      pendingGame.status = GameStatus.ACTIVE;
      pendingGame.startGameDate = new Date();

      const questions = await this.questionRepo
        .createQueryBuilder('q')
        .orderBy('RANDOM()')
        .limit(5)
        .getMany();

      pendingGame.questions = questions.map((q,index) =>
        this.gameQuestionRepo.create({
          game: pendingGame,
          question: q,
          order: index + 1,
        }),
      );

      const savedGame = await this.gameRepo.save(pendingGame);

      const fullGame = await this.gameRepo.findOne({
        where: { id: savedGame.id },
        relations: [
          'questions',
          'questions.question',
          'firstPlayer',
          'firstPlayer.user',
          'firstPlayer.answers',
          'firstPlayer.answers.question',
          'secondPlayer',
          'secondPlayer.user',
          'secondPlayer.answers',
          'secondPlayer.answers.question',
        ],
      });

      return GameViewDto.map(fullGame!);
    }

    const firstProgress = await this.progressRepo.save(
      this.progressRepo.create({
        user,
        score: 0,
      }),
    );

    const game = await this.gameRepo.save(
      this.gameRepo.create({
        status: GameStatus.PENDING_SECOND_PLAYER,
        firstPlayer: firstProgress,
        startGameDate: null,
        finishGameDate: null,
      }),
    );

    const fullGame = await this.gameRepo.findOne({
      where: { id: game.id },
      relations: ['firstPlayer', 'firstPlayer.user'],
    });

    return GameViewDto.map(fullGame!);
  }

  /* ==================== ANSWER ==================== */

  async answer(
    userId: string,
    gameId: string,
    text: string,
  ): Promise<void> {
    const game = await this.gameRepo.findOne({
      where: {
        id: gameId,
        deletedAt: IsNull(),
      },
      relations: [
        'questions',
        'questions.question',
        'firstPlayer',
        'firstPlayer.user',
        'firstPlayer.answers',
        'secondPlayer',
        'secondPlayer.user',
        'secondPlayer.answers',
      ],
    });

    if (!game || game.status !== GameStatus.ACTIVE) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found or not active',
      });
    }

    const player =
      game.firstPlayer.user.id === userId
        ? game.firstPlayer
        : game.secondPlayer?.user.id === userId
          ? game.secondPlayer
          : null;

    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Player not in game',
      });
    }

    if (player.answers.length >= 5) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'All questions already answered',
      });
    }

    const nextQuestion =
      game.questions[player.answers.length];

    const isCorrect = nextQuestion.question.correctAnswers.some(
      answer => answer.toLowerCase() === text.toLowerCase()
    );

    await this.answerRepo.save(
      this.answerRepo.create({
        player,
        question: nextQuestion,
        status: isCorrect
          ? AnswerStatus.CORRECT
          : AnswerStatus.INCORRECT,
        addedAt: new Date(),
      }),
    );

    if (isCorrect) {
      player.score += 1;
    }

    if (player.answers.length + 1 === 5) {
      player.finishedAt = new Date();
    }

    await this.progressRepo.save(player);

    await this.checkFinish(game);
  }

  async findActiveGameByUser(userId: string): Promise<Game | null> {
    return this.gameRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('p.userId = :userId', { userId })
      .andWhere('g.status = :status', {
        status: GameStatus.ACTIVE,
      })
      .getOne();
  }

  async save(game: Game) {
    await this.gameRepo.save(game);
  }
  /* ==================== FINISH LOGIC ==================== */

  private async checkFinish(game: Game): Promise<void> {
    const first = game.firstPlayer;
    const second = game.secondPlayer;

    if (!second) return;

    if (
      first.answers.length === 5 &&
      second.answers.length === 5
    ) {
      if (
        first.score > 0 &&
        first.finishedAt &&
        second.finishedAt &&
        first.finishedAt < second.finishedAt
      ) {
        first.score += 1;
      }

      if (
        second.score > 0 &&
        first.finishedAt &&
        second.finishedAt &&
        second.finishedAt < first.finishedAt
      ) {
        second.score += 1;
      }

      game.status = GameStatus.FINISHED;
      game.finishGameDate = new Date();

      await this.progressRepo.save([first, second]);
      await this.gameRepo.save(game);
    }
  }
}
