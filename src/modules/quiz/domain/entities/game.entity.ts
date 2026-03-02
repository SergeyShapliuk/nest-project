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
}
