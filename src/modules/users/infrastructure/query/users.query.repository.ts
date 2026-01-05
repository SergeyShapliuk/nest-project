import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull, Brackets } from 'typeorm';

import { User } from '../../domain/user.entity';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class UsersQwRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.userRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    queryDto: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = queryDto;

    console.log({ searchLoginTerm, searchEmailTerm });

    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.deletedAt IS NULL');

    /* ========= SEARCH ========= */

    // Используем Brackets для корректного OR условия
    if (searchLoginTerm || searchEmailTerm) {
      qb.andWhere(
        new Brackets(qb2 => {
          if (searchLoginTerm) {
            qb2.orWhere('u.login ILIKE :searchLogin', {
              searchLogin: `%${searchLoginTerm.trim()}%`,
            });
          }
          if (searchEmailTerm) {
            qb2.orWhere('u.email ILIKE :searchEmail', {
              searchEmail: `%${searchEmailTerm.trim()}%`,
            });
          }
        })
      );
    }

    /* ========= SORT ========= */

    qb.orderBy(
      `u.${sortBy}`,
      sortDirection.toUpperCase() as 'ASC' | 'DESC',
    );

    /* ========= PAGINATION ========= */

    qb.skip(queryDto.calculateSkip()).take(pageSize);

    const [users, totalCount] = await qb.getManyAndCount();

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }
}
