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
  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  finishedAt: Date | null;

  @OneToMany(() => Answer, (a) => a.player, { cascade: true })
  answers: Answer[];

  answerCount(): number {
    return this.answers?.length ?? 0;
  }

  addScore(): void {
    this.score++;
  }

  markFinished(): void {
    this.finishedAt = new Date();
  }
}
