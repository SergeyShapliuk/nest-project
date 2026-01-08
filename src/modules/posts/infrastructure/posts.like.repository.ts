import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/post.like.entity';
import { PostLikeViewDto } from '../api/view-dto/posts.like.view-dto';

@Injectable()
export class PostsLikeRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {
  }

  async findLikeById(userId: string, postId: string): Promise<PostLike | null> {
    return this.postLikeRepository.findOne({
      where: { userId, postId, deletedAt: IsNull() },
    });
  }

  async getUserPostLikeStatus(
    postId: string,
    userId?: string,
  ): Promise<'Like' | 'Dislike' | 'None'> {
    if (!userId) return 'None';

    const like = await this.findLikeById(userId, postId);
    return like?.status || 'None';
  }

  async getUserPostLikeStatuses(
    postIds: string[],
    userId?: string,
  ): Promise<Record<string, 'Like' | 'Dislike' | 'None'>> {
    if (!userId || postIds.length === 0) {
      const result: Record<string, 'Like' | 'Dislike' | 'None'> = {};
      postIds.forEach(id => (result[id] = 'None'));
      return result;
    }

    const likes = await this.postLikeRepository
      .createQueryBuilder('pl')
      .select(['pl.postId', 'pl.status'])
      .where('pl.userId = :userId', { userId })
      .andWhere('pl.postId IN (:...postIds)', { postIds })
      .andWhere('pl.deletedAt IS NULL')
      .getMany();

    const result: Record<string, 'Like' | 'Dislike' | 'None'> = {};
    postIds.forEach(id => (result[id] = 'None'));
    likes.forEach(like => (result[like.postId] = like.status));

    return result;
  }

  async getPostNewestLikes(postId: string): Promise<PostLikeViewDto[]> {
    if (!postId) return [];

    console.log({ postId });

    const likes = await this.postLikeRepository.find({
      where: { postId, status: 'Like' },
      order: { createdAt: 'DESC' },
      take: 3,
      select: ['userId', 'login', 'createdAt'],
    });

    console.log('getPostNewestLikes', likes);
    return likes.map(PostLikeViewDto.mapToView);
  }

  async getPostsNewestLikes(
    postIds: string[],
  ): Promise<Record<string, PostLikeViewDto[]>> {
    if (postIds.length === 0) return {};

    console.log('getPostsNewestLikes batch для:', postIds);

    // Вариант 1: Используем QueryBuilder вместо raw query (рекомендуется)
    const allLikes = await this.postLikeRepository
      .createQueryBuilder('pl')
      .select(['pl.postId', 'pl.userId', 'pl.login', 'pl.createdAt'])
      .where('pl.postId IN (:...postIds)', { postIds })
      .andWhere('pl.status = :status', { status: 'Like' })
      .andWhere('pl.deletedAt IS NULL')
      .orderBy('pl.createdAt', 'DESC')
      .getMany();

    console.log('Все лайки полученные batch:', allLikes);

    // Группируем лайки по postId
    const grouped: Record<string, PostLikeViewDto[]> = {};
    postIds.forEach(id => (grouped[id] = []));

    // Счетчики для ограничения (максимум 3 на пост)
    const counters: Record<string, number> = {};
    postIds.forEach(id => (counters[id] = 0));

    // Распределяем лайки
    allLikes.forEach(like => {
      const postId = like.postId;
      if (counters[postId] < 3) {
        grouped[postId].push(
          PostLikeViewDto.mapToView({
            userId: like.userId,
            login: like.login,
            createdAt: like.createdAt,
          } as PostLike),
        );
        counters[postId]++;
      }
    });

    console.log('Сгруппированные лайки:', grouped);
    return grouped;
  }

  async updateLikeStatus(
    postId: string,
    userId: string,
    login: string,
    likeStatus: 'Like' | 'Dislike' | 'None',
  ): Promise<void> {
    const current = await this.postLikeRepository.findOne({
      where: { userId, postId },
    });

    // Если статус не изменился — ничего не делать
    if (current?.status === likeStatus) {
      return;
    }

    // Начинаем транзакцию
    const queryRunner = this.postLikeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Удаляем предыдущую реакцию если была
      if (current) {
        await queryRunner.manager.softDelete(PostLike, { userId, postId });

        // Уменьшаем счетчик предыдущей реакции
        if (current.status === 'Like') {
          await queryRunner.manager.decrement(
            Post,
            { id: postId },
            'extendedLikesInfo.likesCount',
            1,
          );
        } else if (current.status === 'Dislike') {
          await queryRunner.manager.decrement(
            Post,
            { id: postId },
            'extendedLikesInfo.dislikesCount',
            1,
          );
        }
      }

      // Добавляем новую реакцию если не "None"
      if (likeStatus !== 'None') {
        const newLike = this.postLikeRepository.create({
          userId,
          postId,
          login,
          status: likeStatus,
          createdAt: new Date(),
        });

        await queryRunner.manager.save(newLike);

        // Увеличиваем счетчик новой реакции
        if (likeStatus === 'Like') {
          await queryRunner.manager.increment(
            Post,
            { id: postId },
            'extendedLikesInfo.likesCount',
            1,
          );
        } else if (likeStatus === 'Dislike') {
          await queryRunner.manager.increment(
            Post,
            { id: postId },
            'extendedLikesInfo.dislikesCount',
            1,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Альтернативная версия без транзакции (если не нужно атомарное обновление)
  async updateLikeStatusSimple(
    postId: string,
    userId: string,
    login: string,
    likeStatus: 'Like' | 'Dislike' | 'None',
  ): Promise<void> {
    const current = await this.postLikeRepository.findOne({
      where: { userId, postId },
    });

    if (current?.status === likeStatus) {
      return;
    }

    // Удаляем предыдущую реакцию
    if (current) {
      await this.postLikeRepository.softDelete({ userId, postId });

      // Обновляем счетчики в посте
      const post = await this.postRepository.findOne({ where: { id: postId } });
      if (post && post.extendedLikesInfo) {
        if (current.status === 'Like') {
          post.extendedLikesInfo.likesCount = Math.max(0, post.extendedLikesInfo.likesCount - 1);
        } else if (current.status === 'Dislike') {
          post.extendedLikesInfo.dislikesCount = Math.max(0, post.extendedLikesInfo.dislikesCount - 1);
        }
        await this.postRepository.save(post);
      }
    }

    // Добавляем новую реакцию
    if (likeStatus !== 'None') {
      const newLike = this.postLikeRepository.create({
        userId,
        postId,
        login,
        status: likeStatus,
        createdAt: new Date(),
      });

      await this.postLikeRepository.save(newLike);

      // Обновляем счетчики
      const post = await this.postRepository.findOne({ where: { id: postId } });
      if (post) {
        if (!post.extendedLikesInfo) {
          post.extendedLikesInfo = { likesCount: 0, dislikesCount: 0 };
        }

        if (likeStatus === 'Like') {
          post.extendedLikesInfo.likesCount += 1;
        } else if (likeStatus === 'Dislike') {
          post.extendedLikesInfo.dislikesCount += 1;
        }

        await this.postRepository.save(post);
      }
    }
  }
}
