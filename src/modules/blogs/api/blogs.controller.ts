import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus, InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BLOGS_PATH } from '../../../core/paths/paths';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreatePostByBlogInputDto } from '../../posts/api/input-dto/posts.by.blog.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtOptionalAuthGuard } from '../../users/guards/bearer/jwt-optional-auth.guard';
import { Types } from 'mongoose';
import { ExtractUserIfExistsFromRequest } from '../../users/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../users/guards/dto/user-context.dto';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { CreatePostByBlogIdCommand } from '../application/usecases/create-post-by-blog-id.usecase';
import { PostsService } from '../../posts/application/posts.service';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import {
  GetPostsBlogByIdQuery,
  GetPostsBlogByIdQueryHandler,
} from '../application/queries/get-posts-blog-by-id.query-handler';
import { JwtAuthGuard } from '../../users/guards/bearer/jwt-auth.guard';

@Controller(BLOGS_PATH)
export class BlogsController {
  constructor(private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus,
              // private blogsService: BlogsService,
              // private blogsRepository: BlogsRepository,
              // private blogsQwRepository: BlogsQwRepository,
              private postsService: PostsService,
              // private postsQwRepository: PostsQwRepository,
              // private postsByBlogIdQueryRepository: PostsByBlogIdQueryRepository
  ) {
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getAll', query);
    // const { items, totalCount } = await this.userService.findMany(queryInput);
    // const postListOutput = mapToUserListPaginatedOutput(items, {
    //   pageNumber: queryInput.pageNumber,
    //   pageSize: queryInput.pageSize,
    //   totalCount,
    // });
    // return this.blogsQwRepository.getAll(query);
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':blogId')
  async getBlogId(@Param('blogId') blogId: string,
                  @ExtractUserIfExistsFromRequest() user: UserContextDto | null): Promise<BlogViewDto> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getBlogId', blogId);
    console.log('getBlogIdUser', user);
    const blogObjectId = new Types.ObjectId(blogId);
    // return this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
    return this.queryBus.execute(new GetBlogByIdQuery(blogObjectId, user?.id || null));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {

    try {
      const id = await this.commandBus.execute<CreateBlogCommand,
        Types.ObjectId>(new CreateBlogCommand(body));

      return this.queryBus.execute(new GetBlogByIdQuery(id, null));
    } catch {
      // queryBus как и commandBus если мы ставим await дожидаются, когда хендлер отработает.
      // и можем таким способом отловить ошибку, анпример, или просто дождаться исполнения,
      // в отличие от eventBus
      // почему так? потому что у command/query один обработчик, а у
      // event-а может быть много обработчиков.
      console.log('😭');
      throw new InternalServerErrorException();
    }
    // const createdBlogId = await this.blogsService.createBlog(body);
    //
    // return this.blogsQwRepository.getByIdOrNotFoundFail(createdBlogId);

  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':blogId/posts')
  async getPostsByBlogId(@Query() query: GetPostsQueryParams, @Param('blogId') blogId: string,
                         @ExtractUserIfExistsFromRequest() user: UserContextDto | null): Promise<PaginatedViewDto<PostViewDto[]>> {
    console.log('getPostsByBlogId', query);
    console.log('getPostsByBlogId2', blogId);
    // const blogObjectId = new Types.ObjectId(blogId);
    // await this.blogsRepository.findOrNotFoundFail(blogId);
    // return this.postsByBlogIdQueryRepository.getPostsByBlogId(query, blogObjectId);
    return this.queryBus.execute(new GetPostsBlogByIdQuery(query, blogId, user?.id?.toString() || undefined));

  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlog(@Param('blogId') blogId: string, @Body() body: CreatePostByBlogInputDto): Promise<PostViewDto> {
    const postData = {
      ...body,
      blogId, // добавляем blogId в данные
    };
    console.log('createPostByBlog', body);
    console.log('createPostByBlog2', blogId);

    return this.commandBus.execute(new CreatePostByBlogIdCommand(postData));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    // const blogId = await this.blogsService.updateBlog(id, body);
    const objectId = new Types.ObjectId(id);
    return this.commandBus.execute(new UpdateBlogCommand(objectId, body));
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    console.log('deleteBlogController', id);
    const objectId = new Types.ObjectId(id);
    return this.commandBus.execute(new DeleteBlogCommand(objectId));

  }

}
