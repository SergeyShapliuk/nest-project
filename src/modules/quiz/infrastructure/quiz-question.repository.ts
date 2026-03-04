import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Question } from '../domain/entities/question.entity';


@Injectable()
export class QuizQuestionRepository {
  constructor(
    // @InjectRepository(GameQuestion)
    // private readonly GameQuestionRepo: Repository<GameQuestion>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>
  ) {}

  async save(question: Question): Promise<Question> {
    return this.questionRepository.save(question);
  }

  async findById(id: string): Promise<Question | null> {
    return this.questionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByIdOrFail(id: string): Promise<Question> {
    const question = await this.findById(id);
    if (!question) throw new Error('Question not found');
    return question;
  }

  async findPublished(limit?: number): Promise<Question[]> {
    const qb = this.questionRepository
      .createQueryBuilder('q')
      .where('q.published = true')
      .andWhere('q.deletedAt IS NULL')
      .orderBy('RANDOM()');

    if (limit) qb.limit(limit);

    return qb.getMany();
  }

  async softDelete(id: string): Promise<void> {
    await this.questionRepository.softDelete(id);
  }

  // async create(dto: {
  //   body: string;
  //   correctAnswers: string[];
  // }): Promise<Question> {
  //   const question = Question.createInstance(dto);
  //   return this.save(question);
  // }

}
