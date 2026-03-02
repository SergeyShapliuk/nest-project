import { Entity, Column, DeleteDateColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { GameQuestion } from './game-question.entity';

@Entity('questions')
export class Question extends BaseEntity {
  @Column()
  body: string;

  @Column('simple-array') // ["answer1","answer2"]
  correctAnswers: string[];

  @Column({ default: false })
  published: boolean;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => GameQuestion, (gq) => gq.question)
  gameQuestions: GameQuestion[];

  static createInstance(dto: { body: string, correctAnswers: string[] }): Question {
    const question = new Question();

    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;

    return question;
  }

  publish(): void {
    this.published = true;
  }

  unpublish(): void {
    this.published = false;
  }

  /**
   * Marks the blog as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: { body?: string; correctAnswers?: string[] }): void {
    if (dto.body !== undefined) {
      this.body = dto.body;
    }
    if (dto.correctAnswers !== undefined) {
      this.correctAnswers = dto.correctAnswers;
    }
  }

  updatePublish(dto: { published?: boolean }): void {
    if (dto.published !== undefined) {
      this.published = dto.published;
    }
  }
}
