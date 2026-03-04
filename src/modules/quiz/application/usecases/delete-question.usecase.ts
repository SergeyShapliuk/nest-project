import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {
  }
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, void> {
  constructor(private quizQuestionRepository: QuizQuestionRepository) {
  }

  // async execute(command: DeleteQuestionCommand): Promise<void> {
  //   await this.quizQuestionRepository.softDelete(command.id);
  // }
  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    const question = await this.quizQuestionRepository.findByIdOrFail(id);

    question.makeDeleted();

    await this.quizQuestionRepository.save(question);
  }
}
