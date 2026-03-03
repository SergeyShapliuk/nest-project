import { Module } from '@nestjs/common';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './domain/entities/game.entity';
import { PlayerProgress } from './domain/entities/game-player-progress.entity';
import { GameQuestion } from './domain/entities/game-question.entity';
import { Answer } from './domain/entities/answer.entity';
import { Question } from './domain/entities/question.entity';
import { JoinGameUseCase } from './application/usecases/join-game.usecase';
import { GameRepository } from './infrastructure/game.repository';
import { UserModule } from '../users/user.module';
import { GameQueryRepository } from './infrastructure/query/game.query.repository';
import { GetMyCurrentGameHandler } from './application/queries/get-my-current-game.query';
import { GetGameByIdHandler } from './application/queries/get-game-by-id.query';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';
import { UpdateQuestionPublishUseCase } from './application/usecases/update-question-publish.usecase';
import { GetQuizQuestionsHandler } from './application/queries/get-quiz-questions.query';
import { SuperAdminQuizController } from './api/super.admin.quiz.controller';
import { QuizQuestionQueryRepository } from './infrastructure/query/quiz-question.query.repository';
import { QuizQuestionRepository } from './infrastructure/quiz-question.repository';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { AnswerGameUseCase } from './application/usecases/answer-game.usecase';

const commandHandlers = [
  JoinGameUseCase, CreateQuestionUseCase, UpdateQuestionUseCase, UpdateQuestionPublishUseCase, DeleteQuestionUseCase, AnswerGameUseCase,
];

const queryHandlers = [GetMyCurrentGameHandler, GetGameByIdHandler, GetQuizQuestionsHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Game, PlayerProgress, GameQuestion, Answer, Question]), UserModule],
  controllers: [PairGameQuizController, SuperAdminQuizController],
  providers: [...commandHandlers, ...queryHandlers, GameRepository, GameQueryRepository, QuizQuestionQueryRepository, QuizQuestionRepository],
  exports: [],
})
export class QuizModule {
}
