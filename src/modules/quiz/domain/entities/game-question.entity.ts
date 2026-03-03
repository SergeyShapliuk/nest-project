import { Column, Entity, ManyToOne } from 'typeorm';
import { Game } from './game.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Question } from './question.entity';

@Entity('game_questions')
export class GameQuestion extends BaseEntity {
  @ManyToOne(() => Game, (g) => g.questions, {
    onDelete: 'CASCADE',
  })
  game: Game;

  @ManyToOne(() => Question)
  question: Question;

  @Column()
  order: number; // 🔥 обязательно для стабильного порядка
}
