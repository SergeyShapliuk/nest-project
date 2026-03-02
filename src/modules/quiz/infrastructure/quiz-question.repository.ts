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

  async create(dto: {
    body: string;
    correctAnswers: string[];
  }): Promise<Question> {
    const question = Question.createInstance(dto);
    return this.questionRepository.save(question);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find();
  }

  async findById(id: string): Promise<Question | null> {
    console.log('id', id);
    return this.questionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findOrNotFoundFail(id: string): Promise<Question> {
    const question = await this.findById(id);
    console.log('oneToOneBlog:', question);
    if (!question) {
      //TODO: replace with domain exception
      throw new NotFoundException('question not found');
    }

    return question;
  }


  async save(entity: Question): Promise<Question> {
    return this.questionRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.questionRepository.delete(id);
  }
}
