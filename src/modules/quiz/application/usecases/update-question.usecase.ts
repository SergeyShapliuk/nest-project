import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { UpdateQuestionInputDto } from '../../api/input-dto/update-question.input-dto';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public dto: UpdateQuestionInputDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private quizQuestionRepository: QuizQuestionRepository) {}

  async execute({ id, dto }: UpdateQuestionCommand): Promise<void> {
    const entity = await this.quizQuestionRepository.findOrNotFoundFail(id);

    entity.update(dto);

    await this.quizQuestionRepository.save(entity);
  }
}
