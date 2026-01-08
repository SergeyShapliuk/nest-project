import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, IsNull } from 'typeorm';
import { Post } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto, LikeStatus } from '../../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsLikeRepository } from '../posts.like.repository';

@Injectable()
export class PostsQwRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly postsLikeRepository: PostsLikeRepository,
  ) {
  }

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostViewDto> {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: IsNull() },
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
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    } = queryDto;

    const qb = this.postRepository
      .createQueryBuilder('p')
      .where('p.deletedAt IS NULL');

    /* ========= SEARCH ========= */

    // if (queryDto.searchTitleTerm) {
    //   qb.andWhere(
    //     new Brackets(qb2 => {
    //       qb2.where('p.title ILIKE :searchTitle', {
    //         searchTitle: `%${queryDto.searchTitleTerm.trim()}%`,
    //       });
    //     })
    //   );
    // }

    /* ========= SORT ========= */

    const safeSortBy = this.validateSortBy(sortBy);
    qb.orderBy(
      `p.${safeSortBy}`,
      sortDirection.toUpperCase() as 'ASC' | 'DESC',
    );

    /* ========= PAGINATION ========= */

    qb.skip(queryDto.calculateSkip()).take(pageSize);

    /* ========= EXECUTE ========= */

    const [posts, totalCount] = await qb.getManyAndCount();

    /* ========= PROCESS LIKES ========= */

    const postIds = posts.map(post => post.id);
    const [statusesMap, newestLikesMap] = await Promise.all([
      this.postsLikeRepository.getUserPostLikeStatuses(postIds, userId),
      this.postsLikeRepository.getPostsNewestLikes(postIds),
    ]);

    const items = posts.map(post => {
      return PostViewDto.mapToView(
        post,
        statusesMap[post.id] || 'None',
        newestLikesMap[post.id] || [],
      );
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }

  async getByBlogId(
    blogId: string,
    queryDto: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    } = queryDto;

    const qb = this.postRepository
      .createQueryBuilder('p')
      .where('p.deletedAt IS NULL')
      .andWhere('p.blogId = :blogId', { blogId });

    /* ========= SEARCH ========= */

    // if (queryDto.searchTitleTerm) {
    //   qb.andWhere(
    //     new Brackets(qb2 => {
    //       qb2.where('p.title ILIKE :searchTitle', {
    //         searchTitle: `%${queryDto.searchTitleTerm.trim()}%`,
    //       });
    //     })
    //   );
    // }

    /* ========= SORT ========= */

    const safeSortBy = this.validateSortBy(sortBy);
    qb.orderBy(
      `p.${safeSortBy}`,
      sortDirection.toUpperCase() as 'ASC' | 'DESC',
    );

    /* ========= PAGINATION ========= */

    qb.skip(queryDto.calculateSkip()).take(pageSize);

    /* ========= EXECUTE ========= */

    const [posts, totalCount] = await qb.getManyAndCount();

    /* ========= PROCESS LIKES ========= */

    const postIds = posts.map(post => post.id);
    const [statusesMap, newestLikesMap] = await Promise.all([
      this.postsLikeRepository.getUserPostLikeStatuses(postIds, userId),
      this.postsLikeRepository.getPostsNewestLikes(postIds),
    ]);

    const items = posts.map(post => {
      return PostViewDto.mapToView(
        post,
        statusesMap[post.id] || 'None',
        newestLikesMap[post.id] || [],
      );
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }

  // Вспомогательный метод для валидации поля сортировки
  private validateSortBy(sortBy: string): string {
    const allowedSortFields = [
      'title',
      'shortDescription',
      'content',
      'blogName',
      'createdAt',
      'updatedAt',
    ];

    return allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  }
}
