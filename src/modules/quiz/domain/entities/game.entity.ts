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

  getNextQuestion(playerId: string): GameQuestion | null {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    const index = player.answerCount();
    if (!this.questions || index >= this.questions.length) return null;
    return this.questions.sort((a, b) => a.order - b.order)[index];
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

    const nextQuestion = this.getNextQuestion(playerId);
    if (!nextQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'No more questions',
      });
    }

    const isCorrect = nextQuestion.question.checkAnswer(answerText);
    const answer = Answer.create(player, nextQuestion.question, answerText, isCorrect);

    if (!player.answers) player.answers = [];
    player.answers.push(answer);

    if (isCorrect) player.score++;

    this.checkFinish();

    return answer;
  }

  private checkFinish(): void {
    if (this.players.every(p => p.answerCount() >= 5)) {
      this.status = GameStatus.FINISHED;
      this.finishGameDate = new Date();
      this.players.forEach(p => p.markFinished());
    }
  }
}
