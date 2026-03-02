import { PlayerViewDto } from './quiz.player.view-dto';
import { AnswerViewDto } from './quiz.answer.view-dto';

export class PlayerProgressViewDto {
  answers: AnswerViewDto[];
  player: PlayerViewDto;
  score: number;

  static map(progress): PlayerProgressViewDto {
    const dto = new PlayerProgressViewDto();

    dto.score = progress.score;

    dto.player = PlayerViewDto.map(progress.user);

    dto.answers = progress.answers
      ? progress.answers.map((a) => AnswerViewDto.map(a))
      : [];

    return dto;
  }
}
