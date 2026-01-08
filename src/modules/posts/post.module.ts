import { forwardRef, Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQwRepository } from './infrastructure/query/posts.query.repository';
import { BlogModule } from '../blogs/blog.module';
import { PostsByBlogIdQueryRepository } from './infrastructure/query/posts.by.blog.id.query.repository';
import { PostsLikeRepository } from './infrastructure/posts.like.repository';
import { PostLike } from './domain/post.like.entity';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './domain/post.entity';
import { SuperAdminPostsController } from './api/super.admin.posts.controller';


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
    TypeOrmModule.forFeature([Post, PostLike]),
    forwardRef(() => BlogModule),
    CommentModule,
    UserModule],
  controllers: [PostsController,SuperAdminPostsController],
  providers: [...commandHandlers, ...queryHandlers,
    PostsRepository, PostsQwRepository, PostsByBlogIdQueryRepository, PostsLikeRepository,
  ],
  exports: [PostsRepository, PostsLikeRepository, PostsQwRepository, PostsByBlogIdQueryRepository],
})
export class PostModule {
}
