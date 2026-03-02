import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

export class CreateQuestionCommand implements ICommand {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {
  }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand, string> {
  constructor(
    private quizQuestionRepository: QuizQuestionRepository,
  ) {
  }

  async execute({ body, correctAnswers }: CreateQuestionCommand): Promise<string> {
    console.log('❤️ Execute');

    const question = await this.quizQuestionRepository.create(
      { body: body, correctAnswers: correctAnswers },
    );

    return question.id; // Возвращаем string (UUID) вместо Types.ObjectId
  }
}
