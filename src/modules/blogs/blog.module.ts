import { forwardRef, Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQwRepository } from './infrastructure/query/blogs.query.repository';
import { PostModule } from '../posts/post.module';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { CreatePostByBlogIdUseCase } from './application/usecases/create-post-by-blog-id.usecase';
import { UpdateBlogUseCase } from './application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './application/usecases/delete-blog.usecase';
import { GetBlogByIdQueryHandler } from './application/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './application/queries/get-blogs.query-handler';
import { GetPostsBlogByIdQueryHandler } from './application/queries/get-posts-blog-by-id.query-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './domain/blog.entity';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { Post } from '../posts/domain/post.entity';
import { SuperAdminBlogsController } from './api/super.admin.blogs.controller';
import { UpdatePostByBlogUseCase } from './application/usecases/update-post-by-blog.usecase';
import { DeletePostByBlogUseCase } from './application/usecases/delete-post-by-blog.usecase';

const commandHandlers = [
  CreateBlogUseCase,
  CreatePostByBlogIdUseCase,
  UpdateBlogUseCase,
  UpdatePostByBlogUseCase,
  DeleteBlogUseCase,
  DeletePostByBlogUseCase,
];

const queryHandlers = [GetBlogByIdQueryHandler, GetBlogsQueryHandler, GetPostsBlogByIdQueryHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Post]), forwardRef(() => PostModule)],
  controllers: [BlogsController, SuperAdminBlogsController],
  providers: [...commandHandlers, ...queryHandlers,
    BlogsRepository, BlogsQwRepository, PostsRepository,
  ],
  exports: [BlogsRepository],
})
export class BlogModule {
}
