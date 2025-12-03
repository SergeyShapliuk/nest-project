import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { USERS_PATH } from '../../../core/paths/paths';
import { UserViewDto } from './view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersQwRepository } from '../infrastructure/query/users.query.repository';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ApiParam } from '@nestjs/swagger';

@Controller(USERS_PATH)
export class UsersController {
  constructor(private userService: UserService,
              private usersQwRepository: UsersQwRepository) {
  }

  @Get()
  async getAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    // const queryInput = setDefaultSortAndPaginationIfNotExist(query);
    console.log('getAll');
    // const { items, totalCount } = await this.userService.findMany(queryInput);
    // const postListOutput = mapToUserListPaginatedOutput(items, {
    //   pageNumber: queryInput.pageNumber,
    //   pageSize: queryInput.pageSize,
    //   totalCount,
    // });
    return this.usersQwRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {

    const createdUserId = await this.userService.createUser(body);

    return this.usersQwRepository.getByIdOrNotFoundFail(createdUserId);

  }

  @ApiParam({ name: 'id' }) //для сваггер
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {

    return this.userService.deleteUser(id);
  }

}
