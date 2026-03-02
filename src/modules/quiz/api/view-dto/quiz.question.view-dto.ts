import { Question } from '../../domain/entities/question.entity';

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;

  static mapToView(entity: Question): QuestionViewDto {
    const dto = new QuestionViewDto();
    dto.id = entity.id;
    dto.body = entity.body;
    dto.correctAnswers = entity.correctAnswers;
    dto.published = entity.published;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity?.updatedAt?.toISOString() || null;
    return dto;
  }
}
