import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery ,Types} from 'mongoose';

@Injectable()
export class UsersQwRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {
  }

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    queryDto: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    // const {
    //   pageNumber,
    //   pageSize,
    //   sortBy,
    //   sortDirection,
    //   searchLoginTerm,
    //   searchEmailTerm,
    // } = queryDto;
   console.log({queryDto})
    // const skip = (pageNumber - 1) * pageSize;
    // const filter: any = {};
    const orConditions: any[] = [];
    const filter: FilterQuery<User> = {
      deletedAt: null,
    };

    if (queryDto.searchLoginTerm) {
      orConditions.push({
        login: {
          $regex: queryDto.searchLoginTerm.trim(),
          $options: 'i',
        },
        // filter.$or = filter.$or || [];
        // filter.$or.push({
        //   login: { $regex: queryDto.searchLoginTerm, $options: 'i' },
      });
    }

    if (queryDto.searchEmailTerm) {
      orConditions.push({
        email: {
          $regex: queryDto.searchEmailTerm.trim(),
          $options: 'i',
        },
      });
      // filter.$or = filter.$or || [];
      // filter.$or.push({
      //   email: { $regex: queryDto.searchEmailTerm, $options: 'i' },
      // });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
    // const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    const sortDirectionNumber = queryDto.sortDirection === 'asc' ? 1 : -1;

    const users = await this.UserModel
      .find(filter)
      // .collation({locale: "en", strength: 2})
      .sort({ [queryDto.sortBy]: sortDirectionNumber })
      .skip(queryDto.calculateSkip())
      .limit(queryDto.pageSize)
      .exec();

    const totalCount = await this.UserModel.countDocuments(filter);
    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }

}
