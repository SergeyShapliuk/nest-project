import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { Question } from '../../domain/entities/question.entity';

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
    private repo: QuizQuestionRepository,
  ) {
  }

  async execute(command: CreateQuestionCommand) {
    const { body, correctAnswers } = command;
    const question = Question.createInstance({ body, correctAnswers });
    const saved = await this.repo.save(question);
    return saved.id;
  }
}
