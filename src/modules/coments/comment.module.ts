import { forwardRef, Module } from '@nestjs/common';
import { PostModule } from '../posts/post.module';
import { CommentsController } from './api/comments.controller';
import { CommentRepository } from './inftastructure/comment.repository';
import { CommentsQwRepository } from './inftastructure/query/comments.query.repository';
import { Comment } from './domain/comment.entity';
import { GetCommentBlogByIdQueryHandler } from './application/usecases/queries/get-comment-by-id.query-handler';
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecase';
import { UpdateCommentUseCase } from './application/usecases/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './application/usecases/update-comment-like-status.usecase';
import { CommentLikeRepository } from './inftastructure/comment.like.repository';
import { CommentLike } from './domain/comment.like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


const commandHandlers = [
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeleteCommentUseCase,
];

const queryHandlers = [GetCommentBlogByIdQueryHandler];


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentLike]),
    forwardRef(() => PostModule)],
  controllers: [CommentsController],
  providers: [...commandHandlers, ...queryHandlers,
    CommentRepository, CommentsQwRepository, CommentLikeRepository,
  ],
  exports: [
    CommentRepository, // ✅ Экспортируйте
    CommentsQwRepository, // ✅ Экспортируйте
    TypeOrmModule, // ✅ Экспортируем MongooseModule с Comment моделью
  ],
})
export class CommentModule {
}
