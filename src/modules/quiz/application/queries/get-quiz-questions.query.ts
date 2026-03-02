import { GetQuestionsQueryParams } from '../../api/input-dto/get-questions-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Inject } from '@nestjs/common';
import { QuestionViewDto } from '../../api/view-dto/quiz.question.view-dto';
import { QuizQuestionQueryRepository } from '../../infrastructure/query/quiz-question.query.repository';

export class GetQuizQuestionsQuery {
  constructor(public queryParams: GetQuestionsQueryParams) {
  }
}

@QueryHandler(GetQuizQuestionsQuery)
export class GetQuizQuestionsHandler
  implements IQueryHandler<GetQuizQuestionsQuery, PaginatedViewDto<QuestionViewDto[]>> {
  constructor(
    @Inject(QuizQuestionQueryRepository)
    private readonly quizQuestionQueryRepository: QuizQuestionQueryRepository,
  ) {
  }

  async execute(
    query: GetQuizQuestionsQuery,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.quizQuestionQueryRepository.getAll(query.queryParams);
  }
}
