import {
  Entity,
  ManyToOne,
  Column, CreateDateColumn,
} from 'typeorm';
import { PlayerProgress } from './game-player-progress.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { AnswerStatus } from '../enums/answer-status.enum';
import { Question } from './question.entity';

@Entity('answers')
export class Answer extends BaseEntity {
  @ManyToOne(() => PlayerProgress, (p) => p.answers, {
    onDelete: 'CASCADE',
  })
  player: PlayerProgress;

  @ManyToOne(() => Question)
  question: Question;

  @Column()
  answer: string;

  @Column({ type: 'enum', enum: AnswerStatus })
  status: AnswerStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  addedAt: Date;

  static create(player: PlayerProgress, question: Question, answer: string, isCorrect: boolean): Answer {
    const a = new Answer();
    a.player = player;
    a.question = question;
    a.answer = answer;
    a.status = isCorrect ? AnswerStatus.CORRECT : AnswerStatus.INCORRECT;
    a.addedAt = new Date();
    return a;
  }
}
