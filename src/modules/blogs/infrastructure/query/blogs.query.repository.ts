import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blog.entity';
import type { BlogModelType } from '../../domain/blog.entity';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';


@Injectable()
export class BlogsQwRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    queryDto: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
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
    const filter: FilterQuery<Blog> = {
      deletedAt: null,
    };

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
    // const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    const sortDirectionNumber = queryDto.sortDirection === 'asc' ? 1 : -1;

    const blogs = await this.BlogModel
      .find(filter)
      // .collation({locale: "en", strength: 2})
      .sort({ [queryDto.sortBy]: sortDirectionNumber })
      .skip(queryDto.calculateSkip())
      .limit(queryDto.pageSize);
    // .toArray();

    const totalCount = await this.BlogModel.countDocuments(filter);
    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }

}
