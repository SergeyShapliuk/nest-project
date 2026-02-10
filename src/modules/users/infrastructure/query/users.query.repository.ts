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
  ) {
  }

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

    console.log('=== QUERY PARAMS ===');
    console.log({ sortBy, sortDirection, searchLoginTerm, searchEmailTerm });

    const qb = this.userRepo
      .createQueryBuilder('u');
    // .where('u.deletedAt IS NULL');

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
        }),
      );
    }

    /* ========= SORT ========= */
    const direction = sortDirection.toUpperCase() as 'ASC' | 'DESC';

    if (sortBy === 'login' || sortBy === 'email') {
      qb.orderBy(`u.${sortBy} COLLATE "C"`, direction);
    } else {
      qb.orderBy(`u.${sortBy}`, direction);
    }

    /* ========= PAGINATION ========= */

    qb.skip(queryDto.calculateSkip()).take(pageSize);

    const [users, totalCount] = await qb.getManyAndCount();
    console.log('=== FINAL SQL ===');
    console.log(qb.getQueryAndParameters());
// Или если не работает:
    console.log('Query:', qb.getSql());
    console.log('Params:', qb.getParameters());

// Также добавь после getManyAndCount():
    console.log('=== RAW RESULT ===');
    console.log('Users count:', users.length);
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.login} (${u.id.substring(0, 8)}...)`);
    });
    // После получения users
    console.log('=== USER DETAILS ===');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.login} | ${u.email} | created: ${u.createdAt}`);
    });
    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }
}
