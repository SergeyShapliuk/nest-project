import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { POSTS_PATH } from '../../../core/paths/paths';
import { PostViewDto } from './view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PostsQwRepository } from '../infrastructure/query/posts.query.repository';
import { ApiParam } from '@nestjs/swagger';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { BlogViewDto } from '../../blogs/api/view-dto/blogs.view-dto';
import { UpdateBlogInputDto } from '../../blogs/api/input-dto/update-blog.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';

@Controller(POSTS_PATH)
export class PostsController {
  constructor(private postsService: PostsService,
              private postsQwRepository: PostsQwRepository) {
  }

  @Get()
  async getAll(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getAll', query);
    // const { items, totalCount } = await this.userService.findMany(queryInput);
    // const postListOutput = mapToUserListPaginatedOutput(items, {
    //   pageNumber: queryInput.pageNumber,
    //   pageSize: queryInput.pageSize,
    //   totalCount,
    // });
    return this.postsQwRepository.getAll(query);
  }

  @Get(':id')
  async getPostId(@Param('id') id: string): Promise<PostViewDto> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getPostId', id);
    // const { items, totalCount } = await this.userService.findMany(queryInput);
    // const postListOutput = mapToUserListPaginatedOutput(items, {
    //   pageNumber: queryInput.pageNumber,
    //   pageSize: queryInput.pageSize,
    //   totalCount,
    // });
    return this.postsQwRepository.getByIdOrNotFoundFail(id);
  }


  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {

    const createdPostId = await this.postsService.createPost(body);

    return this.postsQwRepository.getByIdOrNotFoundFail(createdPostId);

  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    // const blogId = await this.blogsService.updateBlog(id, body);

    return this.postsService.updatePost(id, body);
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {

    return this.postsService.deletePost(id);
  }

}
