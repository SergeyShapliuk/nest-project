import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { UpdateQuestionPublishInputDto } from '../../api/input-dto/update-question-publish.input-dto';

export class UpdateQuestionPublishCommand {
  constructor(
    public id: string,
    public dto: UpdateQuestionPublishInputDto,
  ) {
  }
}

@CommandHandler(UpdateQuestionPublishCommand)
export class UpdateQuestionPublishUseCase
  implements ICommandHandler<UpdateQuestionPublishCommand, void> {
  constructor(
    // private quizQuestionRepository: QuizQuestionRepository\
    private readonly repo: QuizQuestionRepository,
  ) {
  }

  async execute(command: UpdateQuestionPublishCommand) {
    const question =
      await this.repo.findByIdOrFail(command.id);

    command.dto.published
      ? question.publish()
      : question.unpublish();

    await this.repo.save(question);
  }

  // async execute({ id, dto }: UpdateQuestionPublishCommand): Promise<void> {
  //   const entity = await this.quizQuestionRepository.findOrNotFoundFail(id);
  //
  //   entity.updatePublish(dto);
  //
  //   await this.quizQuestionRepository.save(entity);
  // }
}
