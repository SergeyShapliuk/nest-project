import {
  Entity,
  ManyToOne,
  Column,
} from 'typeorm';
import { GameQuestion } from './game-question.entity';
import { PlayerProgress } from './game-player-progress.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { AnswerStatus } from '../enums/answer-status.enum';

@Entity('answers')
export class Answer extends BaseEntity {
  @ManyToOne(() => PlayerProgress, (p) => p.answers)
  player: PlayerProgress;

  @ManyToOne(() => GameQuestion)
  question: GameQuestion;

  @Column({ type: 'enum', enum: AnswerStatus })
  status: AnswerStatus;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;
}
