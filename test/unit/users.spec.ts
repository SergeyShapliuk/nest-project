import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UsersController } from '../src/modules/users/api/users.controller';
import { UsersQwRepository } from '../src/modules/users/infrastructure/query/users.query.repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('UsersController (unit)', () => {
  let controller: UsersController;

  const mockUsersQwRepository = {
    getByIdOrNotFoundFail: jest.fn(),
    getAll: jest.fn(),
  };

  const mockCommandBus = { execute: jest.fn() };
  const mockQueryBus = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersQwRepository, useValue: mockUsersQwRepository },
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call usersQwRepository.getByIdOrNotFoundFail on getById', async () => {
    const id = new Types.ObjectId();
    const dto = { id: id.toString(), login: 'u' }; // пример
    mockUsersQwRepository.getByIdOrNotFoundFail.mockResolvedValue(dto);

    const result = await controller.getById(id as any);

    expect(mockUsersQwRepository.getByIdOrNotFoundFail).toHaveBeenCalledWith(id);
    expect(result).toEqual(dto);
  });

  it('should call QueryBus for getAll', async () => {
    const mockResult = { items: [], totalCount: 0 };
    mockQueryBus.execute.mockResolvedValue(mockResult);

    const res = await controller.getAll({} as any);

    expect(mockQueryBus.execute).toHaveBeenCalled();
    expect(res).toEqual(mockResult);
  });
});
