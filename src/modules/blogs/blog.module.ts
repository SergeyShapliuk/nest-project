import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogSchema, Blog } from './domain/blog.entity';
import { BlogsQwRepository } from './infrastructure/query/blogs.query.repository';
import { PostModule } from '../posts/post.module';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { CreatePostByBlogIdUseCase } from './application/usecases/create-post-by-blog-id.usecase';
import { UpdateBlogUseCase } from './application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './application/usecases/delete-blog.usecase';
import { GetBlogByIdQueryHandler } from './application/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './application/queries/get-blogs.query-handler';
import { GetPostsBlogByIdQueryHandler } from './application/queries/get-posts-blog-by-id.query-handler';

const commandHandlers = [
  CreateBlogUseCase,
  CreatePostByBlogIdUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

const queryHandlers = [GetBlogByIdQueryHandler, GetBlogsQueryHandler, GetPostsBlogByIdQueryHandler];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]), forwardRef(() => PostModule)],
  controllers: [BlogsController],
  providers: [...commandHandlers, ...queryHandlers,
    BlogsRepository, BlogsQwRepository,
  ],
  exports: [BlogsRepository],
})
export class BlogModule {
}
