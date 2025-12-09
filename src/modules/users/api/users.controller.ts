import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { USERS_PATH } from '../../../core/paths/paths';
import { UserViewDto } from './view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersQwRepository } from '../infrastructure/query/users.query.repository';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';
import { Public } from '../guards/decorators/public.decorator';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';

@Controller(USERS_PATH)
export class UsersController {
  constructor(private userService: UserService,
              private usersQwRepository: UsersQwRepository) {
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<UserViewDto> {
    return this.usersQwRepository.getByIdOrNotFoundFail(id);
  }
  @Public()
  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQwRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {

    const createdUserId = await this.userService.createUser(body);

    return this.usersQwRepository.getByIdOrNotFoundFail(createdUserId);

  }

  @ApiParam({ name: 'id', type: 'string' })
  @Put(':id')
  async updateUser(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    // const userId = await this.userService.updateUser(id, body);

    return this.usersQwRepository.getByIdOrNotFoundFail('userId');
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {

    return this.userService.deleteUser(id);
  }

}
