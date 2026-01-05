import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param, ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { USERS_PATH } from '../../../core/paths/paths';
import { UserViewDto } from './view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersQwRepository } from '../infrastructure/query/users.query.repository';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { Public } from '../guards/decorators/public.decorator';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { CreateUserCommand } from '../application/usecases/admins/create-user.usecase';
import { UpdateUserCommand } from '../application/usecases/update-user.usecase';
import { DeleteUserCommand } from '../application/usecases/admins/delete-user.usecase';
import { UUIDValidationPipe } from '../../../core/pipes/uuid-validation-transformation-pipe.service';

@Controller(USERS_PATH)
export class UsersController {
  constructor(private usersQwRepository: UsersQwRepository,
              private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus) {
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getById(
    @Param('id', UUIDValidationPipe) id: string,
  ): Promise<UserViewDto> {
    // return this.usersQwRepository.getByIdOrNotFoundFail(id);
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Public()
  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQwRepository.getAll(query);
  }

  @Post()
  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {

    // const createdUserId = await this.userService.createUser(body);
    const createdUserId = await this.commandBus.execute<CreateUserCommand,
      string>(new CreateUserCommand(body));

    return this.usersQwRepository.getByIdOrNotFoundFail(createdUserId);

  }

  @ApiParam({ name: 'id', type: 'string' })
  @Put(':id')
  async updateUser(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    await this.commandBus.execute<UpdateUserCommand, void>(
      new UpdateUserCommand(id, body),
    );

    return this.usersQwRepository.getByIdOrNotFoundFail(id);
  }

  @ApiParam({ name: 'id' }) //для сваггер
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(@Param('id', UUIDValidationPipe) id: string): Promise<void> {

    // return this.userService.deleteUser(id);
    return this.commandBus.execute(new DeleteUserCommand(id));
  }

}
