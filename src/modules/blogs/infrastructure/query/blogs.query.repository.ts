import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, IsNull } from 'typeorm';
import { Blog } from '../../domain/blog.entity';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class BlogsQwRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    queryDto: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    } = queryDto;

    console.log({ queryDto });

    const qb = this.blogRepository
      .createQueryBuilder('b')
      .where('b.deletedAt IS NULL');

    /* ========= SEARCH ========= */

    if (searchNameTerm) {
      qb.andWhere(
        new Brackets(qb2 => {
          qb2.where('b.name ILIKE :searchName', {
            searchName: `%${searchNameTerm.trim()}%`,
          });
          // Если нужно искать в других полях, добавляем orWhere:
          // qb2.orWhere('b.description ILIKE :searchName', {
          //   searchName: `%${searchNameTerm.trim()}%`,
          // });
        }),
      );
    }

    /* ========= SORT ========= */

    // Безопасная проверка поля для сортировки
    const safeSortBy = this.validateSortBy(sortBy);
    qb.orderBy(
      `b.${safeSortBy}`,
      sortDirection.toUpperCase() as 'ASC' | 'DESC',
    );

    /* ========= PAGINATION ========= */

    qb.skip(queryDto.calculateSkip()).take(pageSize);

    /* ========= EXECUTE ========= */

    const [blogs, totalCount] = await qb.getManyAndCount();

    const items = blogs.map(BlogViewDto.mapToView);

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
      'name',
      'description',
      'websiteUrl',
      'isMembership',
      'createdAt',
      'updatedAt',
    ];

    return allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  }

}
