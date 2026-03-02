// import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
// import { PAIR_GAME_PATH, POSTS_PATH } from '../../../core/paths/paths';
// import { CommandBus, QueryBus } from '@nestjs/cqrs';
// import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
// import { JwtOptionalAuthGuard } from '../../users/guards/bearer/jwt-optional-auth.guard';
// import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
// import { ExtractUserIfExistsFromRequest } from '../../users/guards/decorators/param/extract-user-if-exists-from-request.decorator';
// import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
// import { PostViewDto } from './view-dto/quiz.view-dto';
// import { GetCommentQueryParams } from '../../coments/api/input-dto/comment-query.input';
// import { CommentViewDto } from '../../coments/api/view-dto/comments.view-dto';
// import { JwtAuthGuard } from '../../users/guards/bearer/jwt-auth.guard';
// import { CommentCreateInputDto } from '../../coments/api/input-dto/comment-create.input';
// import { UpdateLikeStatusDto } from './input-dto/update-like-status.input-dto';
//
// @Controller(PAIR_GAME_PATH)
// export class PostsController {
//   constructor(
//     private postsQwRepository: PostsQwRepository,
//     private readonly commandBus: CommandBus,
//     private readonly queryBus: QueryBus) {
//   }
//
//   @ApiBearerAuth()
//   @UseGuards(JwtOptionalAuthGuard)
//   @Get()
//   async getAll(@Query() query: GetPostsQueryParams,
//                @ExtractUserIfExistsFromRequest() user: { id: string } | null): Promise<PaginatedViewDto<PostViewDto[]>> {
//     console.log('user', user?.id);
//     return this.queryBus.execute<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>(new GetPostsQuery(query, user?.id || undefined));
//   }
//
//   @ApiBearerAuth()
//   @UseGuards(JwtOptionalAuthGuard)
//   @ApiParam({ name: 'id', type: 'string' })
//   @Get(':id')
//   async getPostId(@Param('id') id: string,
//                   @ExtractUserIfExistsFromRequest() user: { id: string } | null): Promise<PostViewDto> {
//     // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
//     console.log('getPostId', user);
//
//     return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(new GetPostByIdQuery(id, user?.id || undefined));
//
//   }
//
//   @ApiBearerAuth()
//   @UseGuards(JwtOptionalAuthGuard)
//   @ApiParam({ name: 'id', type: 'string' })
//   @Get('/:postId/comments')
//   async getCommentByPostId(@Query() query: GetCommentQueryParams,
//                            @Param('postId') postId: string,
//                            @ExtractUserIfExistsFromRequest() user: { id: string } | null): Promise<PaginatedViewDto<CommentViewDto[]>> {
//     // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
//     console.log('getPostId', postId);
//
//     return this.queryBus.execute<GetCommentsByPostIdQuery, PaginatedViewDto<CommentViewDto[]>>(new GetCommentsByPostIdQuery(query, postId, user?.id));
//
//   }
//
//   @ApiBearerAuth()
//   @UseGuards(JwtAuthGuard)
//   // @ApiBasicAuth('basicAuth')
//   // @UseGuards(BasicAuthGuard)
//   @Post('/:postId/comments')
//   async createCommentByPost(@Param('postId') postId: string,
//                             @Body() body: CommentCreateInputDto,
//                             @ExtractUserIfExistsFromRequest() user: { id: string } | null): Promise<CommentViewDto> {
//     console.log('postId', postId);
//     console.log('user', user);
//     return this.commandBus.execute<CreateCommentByPostIdCommand,
//       CommentViewDto>(new CreateCommentByPostIdCommand(body, postId, user?.id));
//   }
//
//   @ApiBearerAuth()
//   @UseGuards(JwtAuthGuard)
//   @Put('/:postId/like-status')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async updateLikeStatusPost(
//     @Param('postId') postId: string,
//     @Body() body: UpdateLikeStatusDto,
//     @ExtractUserIfExistsFromRequest() user: { id: string } | null,
//   ): Promise<void> {
//
//     return this.commandBus.execute<UpdatePostLikeStatusCommand, void>(new UpdatePostLikeStatusCommand(body, postId, user?.id));
//   }
//
// }
