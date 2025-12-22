import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtOptionalAuthGuard } from '../../users/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from '../../users/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../users/guards/dto/user-context.dto';
import { COMMENTS_PATH } from '../../../core/paths/paths';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../users/guards/bearer/jwt-auth.guard';
import { CommentUpdateInputDto } from './input-dto/comment-update.input';
import { GetBlogByIdQuery } from '../../blogs/application/queries/get-blog-by-id.query-handler';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { UpdateCommentLikeStatusCommand } from '../application/usecases/update-comment-like-status.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUserIfExistsFromRequest } from '../../users/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { GetCommentByIdQuery } from '../application/usecases/queries/get-comment-by-id.query-handler';
import { BasicAuthGuard } from '../../users/guards/basic/basic-auth.guard';
import { UpdateLikeStatusDto } from '../../posts/api/input-dto/update-like-status.input-dto';

@Controller(COMMENTS_PATH)
export class CommentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private commandBus: CommandBus,
    // private readonly commentService: CommentService,
    // private readonly commentRepository: CommentRepository,
    // private readonly commentQwRepository: CommentsQwRepository,
  ) {
  }

  // GET /comments/:id
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  async getComment(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ) {
    const objectId = new Types.ObjectId(id);
    console.log('getComments UserId', user?.id);
    // return this.commentQwRepository.getByIdOrNotFoundFail(id);
    return this.queryBus.execute(new GetCommentByIdQuery(objectId, user?.id));

  }

  // PUT /comments/:id
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: string,
    @Body() body: CommentUpdateInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const objectId = new Types.ObjectId(id);
    return this.commandBus.execute(new UpdateCommentCommand(objectId, user.id, body));
  }

  // PUT /comments/:commentId/like-status
  @Put(':commentId/like-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Body() body: UpdateLikeStatusDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const objectId = new Types.ObjectId(commentId);
    return this.commandBus.execute(new UpdateCommentLikeStatusCommand(objectId, user.id, body));

  }

  // DELETE /comments/:id
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const objectId = new Types.ObjectId(id);
    return this.commandBus.execute(new DeleteCommentCommand(objectId, user.id));

  }
}
