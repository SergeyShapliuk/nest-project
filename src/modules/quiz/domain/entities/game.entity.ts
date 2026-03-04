import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany, DeleteDateColumn,
} from 'typeorm';

import { GameQuestion } from './game-question.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { GameStatus } from '../enums/game-status.enum';
import { PlayerProgress } from './game-player-progress.entity';
import { Answer } from './answer.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';


@Entity('pair_games')
export class Game extends BaseEntity {
  @Column({ type: 'enum', enum: GameStatus })
  status: GameStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  finishGameDate: Date | null;

  @OneToOne(() => PlayerProgress, { cascade: true })
  @JoinColumn()
  firstPlayer: PlayerProgress;

  @OneToOne(() => PlayerProgress, { cascade: true, nullable: true })
  @JoinColumn()
  secondPlayer: PlayerProgress | null;

  @OneToMany(() => GameQuestion, (q) => q.game, { cascade: true })
  questions: GameQuestion[];

  @DeleteDateColumn()
  deletedAt: Date | null;

  get players(): PlayerProgress[] {
    return [this.firstPlayer, this.secondPlayer].filter(
      Boolean,
    ) as PlayerProgress[];
  }

  isActive(): boolean {
    return this.status === GameStatus.ACTIVE;
  }

  addSecondPlayer(player: PlayerProgress): void {
    if (this.secondPlayer) {
      throw new Error('Second player already exists');
    }

    this.secondPlayer = player;
    this.status = GameStatus.ACTIVE;
    this.startGameDate = new Date();
  }

  submitAnswer(playerId: string, answerText: string): Answer {
    if (!this.isActive()) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Player not in game',
      });
    }

    const player = this.players.find(p => p.id === playerId);
    console.log('player', player, this.players);
    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Player not in game',
      });
    }

    if (!player.answers) {
      player.answers = []; // гарантируем инициализацию массива
    }
    const currentIndex = player.answerCount();

    if (currentIndex >= this.questions.length) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'All questions already answered',
      });
    }

    const gameQuestion = this.questions[currentIndex];

    const isCorrect = gameQuestion.question.checkAnswer(answerText);
    const answer = Answer.create(
      player,
      gameQuestion.question,
      answerText,
      isCorrect,
    );

    player.answers.push(answer);
    console.log('player.answers', player.answers);
    console.log('gameQuestion', gameQuestion);
    console.log('this.questions', this.questions);
    console.log('currentIndex', currentIndex);
    if (isCorrect) {
      player.addScore();
    }

    if (player.answerCount() === this.questions.length) {
      player.markFinished();
    }

    this.checkFinish();

    return answer;
  }

  private checkFinish(): void {
    if (!this.secondPlayer) return;

    const first = this.firstPlayer;
    const second = this.secondPlayer;

    const firstFinished = first.answerCount() >= 5;
    const secondFinished = second.answerCount() >= 5;

    if (!firstFinished || !secondFinished) return;

    // оба закончили — игра завершается
    this.status = GameStatus.FINISHED;
    this.finishGameDate = new Date();

    first.markFinished();
    second.markFinished();

    // ===== БОНУС =====

    const firstHasCorrect = first.score > 0;
    const secondHasCorrect = second.score > 0;

    if (
      first.finishedAt &&
      second.finishedAt &&
      first.finishedAt < second.finishedAt &&
      firstHasCorrect
    ) {
      first.score += 1;
    }

    if (
      first.finishedAt &&
      second.finishedAt &&
      second.finishedAt < first.finishedAt &&
      secondHasCorrect
    ) {
      second.score += 1;
    }
  }
}
