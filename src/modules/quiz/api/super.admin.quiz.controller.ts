import {
  Body,
  Controller, Delete,
  Get, HttpCode, HttpStatus, Param, Post, Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SUPER_ADMIN_QUESTIONS_PATH } from '../../../core/paths/paths';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserIfExistsFromRequest } from '../../users/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { GetQuestionsQueryParams } from './input-dto/get-questions-query-params.input-dto';
import { QuestionViewDto } from './view-dto/quiz.question.view-dto';
import { GetQuizQuestionsQuery } from '../application/queries/get-quiz-questions.query';
import { BasicAuthGuard } from '../../users/guards/basic/basic-auth.guard';
import { CreateQuestionInputDto } from './input-dto/questions.input-dto';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { QuizQuestionQueryRepository } from '../infrastructure/query/quiz-question.query.repository';
import { UpdateQuestionInputDto } from './input-dto/update-question.input-dto';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { UpdateQuestionPublishInputDto } from './input-dto/update-question-publish.input-dto';
import { UpdateQuestionPublishCommand } from '../application/usecases/update-question-publish.usecase';

@Controller(SUPER_ADMIN_QUESTIONS_PATH)
export class SuperAdminQuizController {
  constructor(
    private quizQuestionQueryRepository: QuizQuestionQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus) {
  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Get()
  async getAll(@Query() query: GetQuestionsQueryParams,
               @ExtractUserIfExistsFromRequest() user: { id: string } | null): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    console.log('user', user?.id);
    return this.queryBus.execute<GetQuizQuestionsQuery, PaginatedViewDto<QuestionViewDto[]>>(new GetQuizQuestionsQuery(query));
  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(@Body() body: CreateQuestionInputDto): Promise<QuestionViewDto> {

    const questionId = await this.commandBus.execute<CreateQuestionCommand,
      string>(new CreateQuestionCommand(body.body, body.correctAnswers));

    return this.quizQuestionQueryRepository.getByIdOrNotFoundFail(questionId);

  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionInputDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdateQuestionCommand, void>(new UpdateQuestionCommand(id, body));
  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionPublish(
    @Param('id') id: string,
    @Body() body: UpdateQuestionPublishInputDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdateQuestionPublishCommand, void>(new UpdateQuestionPublishCommand(id, body));
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {

    return this.commandBus.execute<DeleteQuestionCommand, void>(new DeleteQuestionCommand(id));
  }

}
