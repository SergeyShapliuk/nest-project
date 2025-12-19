import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PostLike, PostLikeDocument } from '../domain/post.like.entity';
import type { PostLikeModelType } from '../domain/post.like.entity';
import { PostLikeViewDto } from '../api/view-dto/posts.like.view-dto';
import type { PostModelType } from '../domain/post.entity';
import { Post } from '../domain/post.entity';


@Injectable()
export class PostsLikeRepository {
  constructor(@InjectModel(Post.name)
              private PostModel: PostModelType,
              @InjectModel(PostLike.name)
              private PostLikeModel: PostLikeModelType,
  ) {
  }


  async findLikeById(userId: string, postId: string): Promise<PostLikeDocument | null> {
    // console.log('id', id);
    return this.PostLikeModel.findOne({ userId, postId, deletedAt: null });
  }

  // async save(newUser: PostDocument) {
  //   await newUser.save();
  // }

  // async findOrNotFoundFail(id: string): Promise<PostDocument> {
  //   const user = await this.findById(id);
  //
  //   if (!user) {
  //     //TODO: replace with domain exception
  //     throw new NotFoundException('post not found');
  //   }
  //
  //   return user;
  // }

  async getUserPostLikeStatus(postId: string, userId?: string): Promise<'Like' | 'Dislike' | 'None'> {
    if (!userId) return 'None';

    const like = await this.findLikeById(userId, postId);
    return like?.status || 'None';
  }

  async getUserPostLikeStatuses(
    postIds: string[],
    userId?: string,
  ): Promise<Record<string, 'Like' | 'Dislike' | 'None'>> {
    if (!userId || postIds.length === 0) {
      // Возвращаем 'None' для всех постов
      const result: Record<string, 'Like' | 'Dislike' | 'None'> = {};
      postIds.forEach(id => result[id] = 'None');
      return result;
    }

    // ОДИН запрос для всех постов!
    const likes = await this.PostLikeModel.find({
      postId: { $in: postIds },
      userId,
    }).select({ postId: 1, status: 1 }).exec();

    // Создаем мап статусов
    const result: Record<string, 'Like' | 'Dislike' | 'None'> = {};

    // Сначала всем ставим 'None'
    postIds.forEach(id => result[id] = 'None');

    // Затем обновляем найденные
    likes.forEach(like => {
      result[like.postId.toString()] = like.status;
    });

    return result;
  }

  async getPostNewestLikes(postId: string): Promise<PostLikeViewDto[]> {
    if (!postId) return [];
    console.log({ postId });
    const likes1 = await this.PostLikeModel.find({ postId });
    console.log({ likes1 });
    const likes = await this.PostLikeModel.find({ postId, status: 'Like' })
      .sort({ createdAt: -1 }) // или addedAt, в зависимости от вашей модели
      .limit(3)
      .select({ userId: 1, login: 1, createdAt: 1, _id: 0 })// выбираем нужные поля
      // .populate("userId", "login") // если login хранится в User модели
      .exec();
    console.log('getPostNewestLikes', likes);
    return likes.map(PostLikeViewDto.mapToView);
  }

  async getPostsNewestLikes(
    postIds: string[],
  ): Promise<Record<string, PostLikeViewDto[]>> {
    if (postIds.length === 0) return {};

    console.log('getPostsNewestLikes batch для:', postIds);

    // ОДИН запрос для всех постов!
    const allLikes = await this.PostLikeModel.find({
      postId: { $in: postIds },
      status: 'Like',
    })
      .sort({ createdAt: -1 })
      .select({ userId: 1, login: 1, createdAt: 1, postId: 1, _id: 0 })
      .exec();

    console.log('Все лайки полученные batch:', allLikes);

    // Группируем лайки по postId
    const grouped: Record<string, PostLikeViewDto[]> = {};

    // Инициализируем для всех postIds пустые массивы
    postIds.forEach(id => grouped[id] = []);

    // Счетчики для ограничения (максимум 3 на пост)
    const counters: Record<string, number> = {};
    postIds.forEach(id => counters[id] = 0);

    // Распределяем лайки по постам (уже отсортированы по дате)
    for (const like of allLikes) {
      const postId = like.postId.toString();

      // Берем только первые 3 лайка для каждого поста
      if (counters[postId] < 3) {
        grouped[postId].push(PostLikeViewDto.mapToView(like));
        counters[postId]++;
      }
    }

    console.log('Сгруппированные лайки:', grouped);
    return grouped;
  }

  async updateLikeStatus(
    postId: string,
    userId: string,
    login: string,
    likeStatus: 'Like' | 'Dislike' | 'None',
  ): Promise<void> {
    const current = await this.PostLikeModel.findOne({ userId, postId });

    // Если статус не изменился — ничего не делать
    if (current?.status === likeStatus) {
      return;
    }

    // Удаляем предыдущую реакцию если была
    if (current) {
      await this.PostLikeModel.deleteOne({ userId, postId });

      // Уменьшаем счетчик предыдущей реакции
      if (current.status === 'Like') {
        await this.PostModel.updateOne(
          { _id: postId },
          { $inc: { 'extendedLikesInfo.likesCount': -1 } },
        );
      } else if (current.status === 'Dislike') {
        await this.PostModel.updateOne(
          { _id: postId },
          { $inc: { 'extendedLikesInfo.dislikesCount': -1 } },
        );
      }
    }

    // Добавляем новую реакцию если не "None"
    if (likeStatus !== 'None') {
      await this.PostLikeModel.create({
        userId,
        postId,
        login,
        status: likeStatus, // ✅ ДОБАВИТЬ статус
        createdAt: new Date().toISOString(),
      });

      // Увеличиваем счетчик новой реакции
      if (likeStatus === 'Like') {
        await this.PostModel.updateOne(
          { _id: postId },
          { $inc: { 'extendedLikesInfo.likesCount': 1 } },
        );
      } else if (likeStatus === 'Dislike') {
        await this.PostModel.updateOne(
          { _id: postId },
          { $inc: { 'extendedLikesInfo.dislikesCount': 1 } },
        );
      }
    }
  }

}
