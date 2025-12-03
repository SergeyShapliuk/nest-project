import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { BLOGS_PATH } from '../../../core/paths/paths';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiParam } from '@nestjs/swagger';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQwRepository } from '../infrastructure/query/blogs.query.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostsByBlogIdQueryRepository } from '../../posts/infrastructure/query/posts.by.blog.id.query.repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostsQwRepository } from '../../posts/infrastructure/query/posts.query.repository';
import { PostsService } from '../../posts/application/posts.service';
import { CreatePostByBlogInputDto } from '../../posts/api/input-dto/posts.by.blog.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';

@Controller(BLOGS_PATH)
export class BlogsController {
  constructor(private blogsService: BlogsService,
              private blogsRepository: BlogsRepository,
              private blogsQwRepository: BlogsQwRepository,
              private postsService: PostsService,
              private postsQwRepository: PostsQwRepository,
              private postsByBlogIdQueryRepository: PostsByBlogIdQueryRepository) {
  }

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
    return this.blogsQwRepository.getAll(query);
  }

  @Get(':blogId')
  async getBlogId(@Param('blogId') blogId: string): Promise<BlogViewDto> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getBlogId', blogId);
    // const { items, totalCount } = await this.userService.findMany(queryInput);
    // const postListOutput = mapToUserListPaginatedOutput(items, {
    //   pageNumber: queryInput.pageNumber,
    //   pageSize: queryInput.pageSize,
    //   totalCount,
    // });
    return this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(@Query() query: GetPostsQueryParams, @Param('blogId') blogId: string): Promise<PaginatedViewDto<PostViewDto[]>> {
    console.log('getPostsByBlogId', query);
    console.log('getPostsByBlogId2', blogId);
    await this.blogsRepository.findOrNotFoundFail(blogId);
    return this.postsByBlogIdQueryRepository.getPostsByBlogId(query, blogId);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {

    const createdBlogId = await this.blogsService.createBlog(body);

    return this.blogsQwRepository.getByIdOrNotFoundFail(createdBlogId);

  }

  @Post(':blogId/posts')
  async createPostByBlog(@Param('blogId') blogId: string, @Body() body: CreatePostByBlogInputDto): Promise<PostViewDto> {
    const postData = {
      ...body,
      blogId, // добавляем blogId в данные
    };
    console.log('createPostByBlog', body);
    console.log('createPostByBlog2', blogId);
    const createPostByBlogId = await this.postsService.createPost(postData);

    return this.postsQwRepository.getByIdOrNotFoundFail(createPostByBlogId);

  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    // const blogId = await this.blogsService.updateBlog(id, body);

    return this.blogsService.updateBlog(id, body);
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {

    return this.blogsService.deleteBlog(id);
  }

}
