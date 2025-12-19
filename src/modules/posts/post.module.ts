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
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { DeletePostUseCase } from './application/usecases/delete-post.usecase';
import { UpdatePostUseCase } from './application/usecases/update-post.usecase';
import { GetPostsQueryHandler } from './application/queries/get-posts.query-handler';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.query-handler';
import { CreateCommentByPostIdUseCase } from './application/usecases/create-comment-by-post-id.usecase';
import { UpdatePostLikeStatusUseCase } from './application/usecases/update-post-like-status.usecase';
import { GetCommentsByPostIdHandler } from './application/queries/get-comments-posts-by-id.query-handler';
import { CommentModule } from '../coments/comment.module';
import { UserModule } from '../users/user.module';


const commandHandlers = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentByPostIdUseCase,
  UpdatePostLikeStatusUseCase,
];

const queryHandlers = [GetPostsQueryHandler, GetPostByIdQueryHandler, GetCommentsByPostIdHandler];


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, {
      name: PostLike.name,
      schema: PostLikeSchema,
    }]), forwardRef(() => BlogModule),
    CommentModule,
    UserModule],
  controllers: [PostsController],
  providers: [...commandHandlers, ...queryHandlers,
    PostsService, PostsRepository, PostsQwRepository, PostsByBlogIdQueryRepository, PostsLikeRepository,
  ],
  exports: [PostsService, PostsQwRepository, PostsByBlogIdQueryRepository],
})
export class PostModule {
}
