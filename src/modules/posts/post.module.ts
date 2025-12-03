import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQwRepository } from './infrastructure/query/posts.query.repository';
import { Post, PostSchema } from './domain/post.entity';
import { BlogModule } from '../blogs/blog.module';
import { PostsByBlogIdQueryRepository } from './infrastructure/query/posts.by.blog.id.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]), forwardRef(() => BlogModule)],
  controllers: [PostsController],
  providers: [
    PostsService, PostsRepository, PostsQwRepository, PostsByBlogIdQueryRepository,
  ],
  exports: [PostsService, PostsQwRepository, PostsByBlogIdQueryRepository],
})
export class PostModule {
}
