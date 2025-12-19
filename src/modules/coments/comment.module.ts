import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from '../posts/post.module';
import { CommentsController } from './api/comments.controller';
import { CommentRepository } from './inftastructure/comment.repository';
import { CommentsQwRepository } from './inftastructure/query/comments.query.repository';
import { Comment, CommentSchema } from './domain/comment.entity';
import { GetCommentBlogByIdQueryHandler } from './application/usecases/queries/get-comment-by-id.query-handler';
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecase';
import { UpdateCommentUseCase } from './application/usecases/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './application/usecases/update-comment-like-status.usecase';
import { CommentLikeRepository } from './inftastructure/comment.like.repository';
import { CommentLike, CommentLikeSchema } from './domain/comment.like.entity';

const commandHandlers = [
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeleteCommentUseCase,
];

const queryHandlers = [GetCommentBlogByIdQueryHandler];


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: CommentLike.name, schema: CommentLikeSchema }]),
    forwardRef(() => PostModule)],
  controllers: [CommentsController],
  providers: [...commandHandlers, ...queryHandlers,
    CommentRepository, CommentsQwRepository, CommentLikeRepository,
  ],
  exports: [
    CommentRepository, // ✅ Экспортируйте
    CommentsQwRepository, // ✅ Экспортируйте
    MongooseModule, // ✅ Экспортируем MongooseModule с Comment моделью
  ],
})
export class CommentModule {
}
