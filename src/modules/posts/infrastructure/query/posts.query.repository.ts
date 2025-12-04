import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { PostsLikeRepository } from '../posts.like.repository';

@Injectable()
export class PostsQwRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsLikeRepository: PostsLikeRepository,
  ) {
  }

  async getByIdOrNotFoundFail(id: string, userId?: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }
    const [myStatus, newestLikes] = await Promise.all([
      this.postsLikeRepository.getUserPostLikeStatus(id, userId),
      this.postsLikeRepository.getPostNewestLikes(id),
    ]);
    return PostViewDto.mapToView(post, myStatus, newestLikes);
  }

  async getAll(
    queryDto: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // const {
    //   pageNumber,
    //   pageSize,
    //   sortBy,
    //   sortDirection,
    //   searchLoginTerm,
    //   searchEmailTerm,
    // } = queryDto;
    //
    // const skip = (pageNumber - 1) * pageSize;
    // const filter: any = {};
    const orConditions: any[] = [];
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
    // const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    const sortDirectionNumber = queryDto.sortDirection === 'asc' ? 1 : -1;

    const posts = await this.PostModel
      .find(filter)
      // .collation({locale: "en", strength: 2})
      .sort({ [queryDto.sortBy]: sortDirectionNumber })
      .skip(queryDto.calculateSkip())
      .limit(queryDto.pageSize);
    // .toArray();

    const totalCount = await this.PostModel.countDocuments(filter);

    // Получаем все необходимые данные о лайках
    const postIds = posts.map(post => post._id.toString());
    const [statusesMap, newestLikesMap] = await Promise.all([
      this.postsLikeRepository.getUserPostLikeStatuses(postIds, userId),
      this.postsLikeRepository.getPostsNewestLikes(postIds),
    ]);
    // Маппим синхронно (без дополнительных запросов к БД)
    const items = posts.map(post => {
      const postId = post._id.toString();
      return PostViewDto.mapToView(
        post,
        statusesMap[postId] || 'None',
        newestLikesMap[postId] || [],
      );
    });
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }

}
