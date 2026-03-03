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

  getNextQuestionForPlayer(playerId: string): GameQuestion | null {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    const index = player.answers?.length ?? 0;

    if (!this.questions || index >= this.questions.length) {
      return null;
    }

    return this.questions
      .sort((a, b) => a.order - b.order)[index];
  }

  answerQuestion(
    player: PlayerProgress,
    question: GameQuestion,
    answerText: string,
  ): Answer {

    const normalized = answerText.trim();

    const isCorrect =
      question.question.correctAnswers.includes(normalized);

    const answer = Answer.create(
      player,
      question.question,
      normalized,
      isCorrect,
    );

    if (!player.answers) {
      player.answers = [];
    }

    player.answers.push(answer);

    if (isCorrect) {
      player.score++;
    }

    this.checkFinish();

    return answer;
  }

  checkFinish() {
    const finished = this.players.every(
      p => (p.answers?.length ?? 0) >= 5,
    );

    if (finished) {
      this.status = GameStatus.FINISHED; // проверить enum
      this.finishGameDate = new Date();
    }
  }
}
