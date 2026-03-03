import {
  Body,
  Controller,
  Get,
  Param, ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PAIR_GAME_PATH } from '../../../core/paths/paths';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserIfExistsFromRequest } from '../../users/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { JoinGameCommand } from '../application/usecases/join-game.usecase';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../users/guards/bearer/jwt-auth.guard';
import { GameViewDto } from './view-dto/quiz.view-dto';
import { GetMyCurrentGameQuery } from '../application/queries/get-my-current-game.query';
import { GetGameByIdQuery } from '../application/queries/get-game-by-id.query';
import { CreateQuestionInputDto } from './input-dto/questions.input-dto';
import { AnswerInputDto } from './input-dto/answer.input-dto';
import { AnswerGameCommand } from '../application/usecases/answer-game.usecase';
import { AnswerViewDto } from './view-dto/quiz.answer.view-dto';

@Controller(PAIR_GAME_PATH)
export class PairGameQuizController {
  constructor(private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus) {
  }

  @ApiBearerAuth()
  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  async getMyCurrent(@ExtractUserIfExistsFromRequest() user: { id: string }) {
    return this.queryBus.execute<GetMyCurrentGameQuery, GameViewDto>(
      new GetMyCurrentGameQuery(user.id),
    );
  }

  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUserIfExistsFromRequest() user: { id: string },
  ) {
    return this.queryBus.execute<GetGameByIdQuery, GameViewDto>(
      new GetGameByIdQuery(id, user.id),
    );
  }

  @ApiBearerAuth()
  @Post('connection')
  @UseGuards(JwtAuthGuard)
  async join(@ExtractUserIfExistsFromRequest() user: { id: string }) {
    // async join() {
    console.log('join', user.id);
    return this.commandBus.execute<JoinGameCommand, GameViewDto>(new JoinGameCommand(user.id));
  }

  @ApiBearerAuth()
  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard)
  async answer(@Body() body: AnswerInputDto,
               @ExtractUserIfExistsFromRequest() user: { id: string }) {
    // async join() {
    console.log('join', user.id);
    return this.commandBus.execute<AnswerGameCommand, AnswerViewDto>(new AnswerGameCommand(user.id, body.answer));
  }

}
