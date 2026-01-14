import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from '../src/modules/blogs/api/blogs.controller';
import { BlogsQwRepository } from '../src/modules/blogs/infrastructure/query/blogs.query.repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('BlogsController (unit)', () => {
  let controller: BlogsController;
  const mockQw = { getByIdOrNotFoundFail: jest.fn(), getAll: jest.fn() };
  const mockCmd = { execute: jest.fn() };
  const mockQry = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        { provide: BlogsQwRepository, useValue: mockQw },
        { provide: CommandBus, useValue: mockCmd },
        { provide: QueryBus, useValue: mockQry },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
  });

  afterEach(() => jest.resetAllMocks());

  it('should call query bus for list', async () => {
    mockQry.execute.mockResolvedValue({ items: [], totalCount: 0 });
    const res = await controller.getAll({} as any);
    expect(mockQry.execute).toHaveBeenCalled();
    expect(res).toBeDefined();
  });
});
