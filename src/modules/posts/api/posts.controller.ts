import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { POSTS_PATH } from '../../../core/paths/paths';
import { PostViewDto } from './view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PostsQwRepository } from '../infrastructure/query/posts.query.repository';
import { ApiBasicAuth, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { JwtOptionalAuthGuard } from '../../users/guards/bearer/jwt-optional-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserIfExistsFromRequest } from '../../users/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../users/guards/dto/user-context.dto';
import { Types } from 'mongoose';
import { GetPostsQuery } from '../application/queries/get-posts.query-handler';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query-handler';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { CommentViewDto } from '../../coments/api/view-dto/comments.view-dto';
import { GetCommentsByPostIdQuery } from '../application/queries/get-comments-posts-by-id.query-handler';
import { CommentCreateInputDto } from '../../coments/api/input-dto/comment-create.input';
import { CreateCommentByPostIdCommand } from '../application/usecases/create-comment-by-post-id.usecase';
import { UpdatePostLikeStatusCommand } from '../application/usecases/update-post-like-status.usecase';
import { GetCommentQueryParams } from '../../coments/api/input-dto/comment-query.input';
import { JwtAuthGuard } from '../../users/guards/bearer/jwt-auth.guard';
import { BasicAuthGuard } from '../../users/guards/basic/basic-auth.guard';
import { UpdateLikeStatusDto } from './input-dto/update-like-status.input-dto';

@Controller(POSTS_PATH)
export class PostsController {
  constructor(private postsService: PostsService,
              private postsQwRepository: PostsQwRepository,
              private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus) {
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAll(@Query() query: GetPostsQueryParams,
               @ExtractUserIfExistsFromRequest() user: UserContextDto | null): Promise<PaginatedViewDto<PostViewDto[]>> {
    console.log('user', user?.id);
    return this.queryBus.execute<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>(new GetPostsQuery(query, user?.id));
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getPostId(@Param('id') id: string,
                  @ExtractUserIfExistsFromRequest() user: UserContextDto | null): Promise<PostViewDto> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getPostId', user);
    const objectId = new Types.ObjectId(id);
    return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(new GetPostByIdQuery(objectId, user?.id || undefined));

  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {

    const postId = await this.commandBus.execute<CreatePostCommand,
      Types.ObjectId>(new CreatePostCommand(body));

    return this.postsQwRepository.getByIdOrNotFoundFail(postId);

  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    const objectId = new Types.ObjectId(id);
    return this.commandBus.execute<UpdatePostCommand, void>(new UpdatePostCommand(objectId, body));
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {

    const objectId = new Types.ObjectId(id);
    return this.commandBus.execute<DeletePostCommand, void>(new DeletePostCommand(objectId));
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'id', type: 'string' })
  @Get('/:postId/comments')
  async getCommentByPostId(@Query() query: GetCommentQueryParams,
                           @Param('postId') postId: string,
                           @ExtractUserIfExistsFromRequest() user: UserContextDto | null): Promise<PaginatedViewDto<CommentViewDto[]>> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getPostId', postId);
    const objectId = new Types.ObjectId(postId);
    return this.queryBus.execute<GetCommentsByPostIdQuery, PaginatedViewDto<CommentViewDto[]>>(new GetCommentsByPostIdQuery(query, objectId, user?.id || undefined));

  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/:postId/comments')
  async createCommentByPost(@Param('postId') postId: string,
                            @Body() body: CommentCreateInputDto,
                            @ExtractUserIfExistsFromRequest() user: UserContextDto | null): Promise<CommentViewDto> {
    const objectId = new Types.ObjectId(postId);
    return this.commandBus.execute<CreateCommentByPostIdCommand,
      CommentViewDto>(new CreateCommentByPostIdCommand(body, objectId, user?.id));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/:postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatusPost(
    @Param('postId') postId: string,
    @Body() body: UpdateLikeStatusDto,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<void> {
    const objectId = new Types.ObjectId(postId);
    return this.commandBus.execute<UpdatePostLikeStatusCommand, void>(new UpdatePostLikeStatusCommand(body, objectId, user?.id));
  }

}
