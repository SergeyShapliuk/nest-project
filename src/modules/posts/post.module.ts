import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQwRepository } from './infrastructure/query/posts.query.repository';
import { Post, PostSchema } from './domain/post.entity';
import { BlogModule } from '../blogs/blog.module';
import { PostsByBlogIdQueryRepository } from './infrastructure/query/posts.by.blog.id.query.repository';
import { PostsLikeRepository } from './infrastructure/posts.like.repository';
import { PostLike, PostLikeSchema } from './domain/post.like.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, {
      name: PostLike.name,
      schema: PostLikeSchema,
    }]), forwardRef(() => BlogModule)],
  controllers: [PostsController],
  providers: [
    PostsService, PostsRepository, PostsQwRepository, PostsByBlogIdQueryRepository, PostsLikeRepository,
  ],
  exports: [PostsService, PostsQwRepository, PostsByBlogIdQueryRepository],
})
export class PostModule {
}
