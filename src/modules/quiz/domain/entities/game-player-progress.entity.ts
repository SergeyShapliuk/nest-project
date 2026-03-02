import {
  Entity,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { Answer } from './answer.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { User } from '../../../users/domain/user.entity';

@Entity('player_progress')
export class PlayerProgress extends BaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  finishedAt: Date | null;

  @OneToMany(() => Answer, (a) => a.player, { cascade: true })
  answers: Answer[];
}
