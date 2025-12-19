import { WithId } from 'mongodb';
import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from '../domain/comment.entity';
import { Comment } from '../domain/comment.entity';
import type { CommentLikeModelType } from '../domain/comment.like.entity';
import { CommentLike } from '../domain/comment.like.entity';

@Injectable()
export class CommentLikeRepository {
  constructor(@InjectModel(CommentLike.name)
              private CommentLikeModel: CommentLikeModelType,
              @InjectModel(Comment.name)
              private CommentModel: CommentModelType) {
  }


  async findLikeById(userId: string, commentId: string): Promise<WithId<CommentLike> | null> {
    return this.CommentLikeModel.findOne({ userId, commentId });
  }

  // async findLikeByIdOrFail(userId: string, commentId: string): Promise<WithId<CommentLike>> {
  //   const res = await this.findLikeById(userId, commentId);
  //   if (!res) {
  //     // throw new RepositoryNotFoundError("Like not exist");
  //   }
  //   return res;
  // }

  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<void> {
    const currentLike = await this.findLikeById(userId, commentId);

    if (currentLike?.status === likeStatus) {
      return;
    }

    // УБИРАЕМ транзакции - выполняем операции последовательно
    try {
      // Удаляем предыдущий лайк если был
      if (currentLike) {
        await this.CommentLikeModel.deleteOne({ userId, commentId });

        // Уменьшаем предыдущий счетчик
        const previousField = currentLike.status === 'Like'
          ? { 'likesInfo.likesCount': -1 }
          : { 'likesInfo.dislikesCount': -1 };

        await this.CommentModel.updateOne(
          { _id: new Types.ObjectId(commentId) },
          { $inc: previousField },
        );
      }

      // Добавляем новый лайк если не "None"
      if (likeStatus !== 'None') {
        await this.CommentLikeModel.create({
          userId,
          commentId,
          status: likeStatus as 'Like' | 'Dislike',
        });

        // Увеличиваем новый счетчик
        const newField = likeStatus === 'Like'
          ? { 'likesInfo.likesCount': 1 }
          : { 'likesInfo.dislikesCount': 1 };

        await this.CommentModel.updateOne(
          { _id: new Types.ObjectId(commentId) },
          { $inc: newField },
        );
      }
    } catch (error) {
      // Логируем ошибку, но не блокируем всю операцию
      console.error('Error updating like status:', error);
      throw error;
    }
  }

  async getUserLikeStatus(commentId: string, userId?: string): Promise<'Like' | 'Dislike' | 'None'> {
    if (!userId) return 'None';

    const like = await this.CommentLikeModel.findOne({ userId, commentId });
    return like?.status || 'None';
  }
}
