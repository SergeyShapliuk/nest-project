import { Entity, ManyToOne } from 'typeorm';
import { Game } from './game.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Question } from './question.entity';

@Entity('game_questions')
export class GameQuestion extends BaseEntity {
  @ManyToOne(() => Game, (g) => g.questions)
  game: Game;

  @ManyToOne(() => Question)
  question: Question;
}
