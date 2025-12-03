import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';


@Injectable()
export class PostsByBlogIdQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {
  }

  async getPostsByBlogId(
    queryDto: GetPostsQueryParams,
    blogId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {

    console.log('getPostsByBlogId', queryDto);
    console.log('getPostsByBlogId2', blogId);

    const orConditions: any[] = [];
    const filter: FilterQuery<Post> = {
      blogId,
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
    const items = posts.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }

}
