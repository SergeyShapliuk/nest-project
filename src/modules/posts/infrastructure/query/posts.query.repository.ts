import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class PostsQwRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {
  }

  async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
    const user = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('post not found');
    }

    return PostViewDto.mapToView(user);
  }

  async getAll(
    queryDto: GetPostsQueryParams,
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

    const users = await this.PostModel
      .find(filter)
      // .collation({locale: "en", strength: 2})
      .sort({ [queryDto.sortBy]: sortDirectionNumber })
      .skip(queryDto.calculateSkip())
      .limit(queryDto.pageSize);
    // .toArray();

    const totalCount = await this.PostModel.countDocuments(filter);
    const items = users.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }

}
