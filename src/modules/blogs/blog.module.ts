import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogSchema, Blog } from './domain/blog.entity';
import { BlogsQwRepository } from './infrastructure/query/blogs.query.repository';
import { PostsByBlogIdQueryRepository } from '../posts/infrastructure/query/posts.by.blog.id.query.repository';
import { PostModule } from '../posts/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]), forwardRef(() => PostModule)],
  controllers: [BlogsController],
  providers: [
    BlogsService, BlogsRepository, BlogsQwRepository,
  ],
  exports: [BlogsRepository],
})
export class BlogModule {
}
