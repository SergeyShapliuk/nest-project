import { AnswerStatus } from '../../domain/enums/answer-status.enum';

export class AnswerViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;

  static map(answer): AnswerViewDto {
    const dto = new AnswerViewDto();
    dto.questionId = answer.question.id;
    dto.answerStatus = answer.status;
    dto.addedAt = answer.addedAt.toISOString();
    return dto;
  }
}
