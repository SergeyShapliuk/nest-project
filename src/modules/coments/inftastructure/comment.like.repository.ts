import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { CommentLike } from '../domain/comment.like.entity';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly dataSource: DataSource, // Для транзакций
  ) {
  }

  // Поиск лайка пользователя для комментария
  async findLikeById(userId: string, commentId: string): Promise<CommentLike | null> {
    return this.commentLikeRepository.findOne({
      where: { userId, commentId, deletedAt: IsNull() },
    });
  }

  // Обновление статуса лайка с транзакцией
  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: 'Like' | 'Dislike' | 'None',
  ): Promise<void> {
    const queryRunner = this.commentLikeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Находим текущую реакцию (включая удаленные)
      const current = await queryRunner.manager.findOne(CommentLike, {
        where: { userId, commentId },
        withDeleted: true,
      });

      // Если статус "None" - удаляем реакцию
      if (likeStatus === 'None') {
        if (current) {
          await queryRunner.manager.softDelete(CommentLike, { userId, commentId });
        }
      } else {
        // Если есть существующая запись - обновляем ее
        if (current) {
          if (current.deletedAt) {
            await queryRunner.manager.restore(CommentLike, { userId, commentId });
          }
          current.status = likeStatus;
          current.updatedAt = new Date();
          current.deletedAt = null;
          await queryRunner.manager.save(current);
        } else {
          // Создаем новую запись
          const newLike = queryRunner.manager.create(CommentLike, {
            userId,
            commentId,
            status: likeStatus,
            createdAt: new Date(),
            user: { id: userId },
            comment: { id: commentId },
          });
          await queryRunner.manager.save(newLike);
        }
      }

      // Пересчитываем счетчики
      const comment = await queryRunner.manager.findOne(Comment, {
        where: { id: commentId },
      });

      if (comment) {
        const activeLikes = await queryRunner.manager.find(CommentLike, {
          where: {
            commentId,
            deletedAt: IsNull(),
          },
        });

        comment.likesInfo.likesCount = activeLikes.filter(l => l.status === 'Like').length;
        comment.likesInfo.dislikesCount = activeLikes.filter(l => l.status === 'Dislike').length;

        await queryRunner.manager.save(comment);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }


  // Получение статуса лайка пользователя
  async getUserLikeStatus(
    commentId: string,
    userId?: string,
  ): Promise<'Like' | 'Dislike' | 'None'> {
    if (!userId) return 'None';

    const like = await this.commentLikeRepository.findOne({
      where: {
        userId ,
        commentId,
      },
      select: ['status'],
    });

    return like?.status || 'None';
  }

  // Получение статусов лайков для нескольких комментариев (оптимизация)
  async getLikeStatusesForComments(
    commentIds: string[],
    userId: string,
  ): Promise<{ [commentId: string]: 'Like' | 'Dislike' | 'None' }> {
    if (!userId || commentIds.length === 0) {
      return Object.fromEntries(commentIds.map(id => [id, 'None']));
    }

    // Используем дублирующее поле commentId для оптимизации
    const likes = await this.commentLikeRepository.find({
      where: {
        userId, // Прямое сравнение, без JOIN
        commentId: In(commentIds),
        deletedAt: IsNull(), // исключаем удаленные
      },
      select: ['status', 'commentId'], // выбираем только нужные поля
    });

    const result: { [commentId: string]: 'Like' | 'Dislike' | 'None' } = {};

    // Инициализируем все как 'None'
    commentIds.forEach(id => result[id] = 'None');

    // Заполняем найденные статусы
    likes.forEach(like => {
      if (like.commentId && like.status) {
        result[like.commentId] = like.status;
      }
    });

    return result;
  }
}
