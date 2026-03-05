import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Game } from '../../domain/entities/game.entity';
import { GameViewDto } from '../../api/view-dto/quiz.view-dto';
import { GameStatus } from '../../domain/enums/game-status.enum';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';


@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {
  }

  async findCurrentGame(userId: string): Promise<GameViewDto | null> {
    const game = await this.gameRepo
      .createQueryBuilder('g')

      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'question')

      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('fp.user', 'fpUser')
      .leftJoinAndSelect('fp.answers', 'fpAnswers')
      .leftJoinAndSelect('fpAnswers.question', 'fpAnswerQuestion')

      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .leftJoinAndSelect('sp.user', 'spUser')
      .leftJoinAndSelect('sp.answers', 'spAnswers')
      .leftJoinAndSelect('spAnswers.question', 'spAnswerQuestion')

      .where('(fpUser.id = :userId OR spUser.id = :userId)', {
        userId,
      })
      .andWhere(
        'g.status = ANY(:statuses::pair_games_status_enum[])',
        { statuses: [GameStatus.PENDING_SECOND_PLAYER, GameStatus.ACTIVE] },
      )
      .andWhere('g.deletedAt IS NULL')
      .orderBy('g.createdAt', 'DESC')
      .addOrderBy('gq.order', 'ASC')
      .getOne();

    if (!game) return null;

    return GameViewDto.map(game);
  }

  async findById(
    gameId: string,
    userId: string,
  ): Promise<GameViewDto | null> {
    const game = await this.gameRepo
      .createQueryBuilder('g')

      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'question')

      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('fp.user', 'fpUser')
      .leftJoinAndSelect('fp.answers', 'fpAnswers')
      .leftJoinAndSelect('fpAnswers.question', 'fpAnswerQuestion')

      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .leftJoinAndSelect('sp.user', 'spUser')
      .leftJoinAndSelect('sp.answers', 'spAnswers')
      .leftJoinAndSelect('spAnswers.question', 'spAnswerQuestion')

      .where('g.id = :gameId', { gameId })
      .andWhere('(fpUser.id = :userId OR spUser.id = :userId)', {
        userId,
      })
      .andWhere('g.deletedAt IS NULL')
      .getOne();

    if (!game) return null;

    return GameViewDto.map(game);
  }

  async findByIdByPair(
    gameId: string,
    userId: string,
  ): Promise<GameViewDto | null> {
    const game = await this.gameRepo.findOne({
      where: { id: gameId, deletedAt: IsNull() },
      relations: [
        'firstPlayer',
        'firstPlayer.user',
        'secondPlayer',
        'secondPlayer.user',
        'questions',
        'questions.question',
      ],
    });

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found',
      });
    }

    const isParticipant =
      game.firstPlayer.user.id === userId ||
      game.secondPlayer?.user.id === userId;

    if (!isParticipant) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Current user tries to get pair in which user is not participant',
      });
    }

    return GameViewDto.map(game);
  }
}
