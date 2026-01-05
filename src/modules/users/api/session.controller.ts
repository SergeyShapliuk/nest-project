import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SECURITY_PATH } from '../../../core/paths/paths';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SessionsViewDto } from './view-dto/sessions.view-dto';
import { GetSessionsQuery } from '../application/queries/get-sessions.query-handler';
import { RefreshTokenGuard } from '../guards/refresh/refresh-auth.guard';
import type { Request } from 'express';
import { ApiParam } from '@nestjs/swagger';
import { DeleteSessionCommand } from '../application/usecases/delete-session.usecase';
import { DeleteSessionsCommand } from '../application/usecases/delete-sessions.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller(SECURITY_PATH)
export class SessionController {
  constructor(
    // private postsService: PostsService,
    //           private postsQwRepository: PostsQwRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus) {
  }

  // @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Get('devices')
  async getAll(@Req() req: Request): Promise<SessionsViewDto[]> {
    const userId = req.user?.id;
    console.log({ userId });
    return this.queryBus.execute<GetSessionsQuery, SessionsViewDto[]>(new GetSessionsQuery(userId));
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @UseGuards(RefreshTokenGuard)
  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Param('deviceId') deviceId: string,
                      @Req() req: Request): Promise<void> {
    const userId = req.user?.id;       // теперь TypeScript знает, что есть user
    // const device = req.device;
    console.log('deleteBlogController', userId, deviceId);
    // const objectId = new Types.ObjectId(deviceId);
    return this.commandBus.execute<DeleteSessionCommand, void>(new DeleteSessionCommand(userId, deviceId));

  }

  @ApiParam({ name: 'id' }) //для сваггер
  @UseGuards(RefreshTokenGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessions(@Req() req: Request): Promise<void> {
    const userId = req.user?.id;       // теперь TypeScript знает, что есть user
    const deviceId = req.device?.id;
    console.log('deleteSessions', userId, deviceId);
    // const objectId = new Types.ObjectId(deviceId);
    return this.commandBus.execute<DeleteSessionsCommand, void>(new DeleteSessionsCommand(userId, deviceId));

  }

}
