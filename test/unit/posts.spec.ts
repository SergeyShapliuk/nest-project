import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../src/modules/posts/api/posts.controller';
import { PostsQwRepository } from '../src/modules/posts/infrastructure/query/posts.query.repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';

describe('PostsController (unit)', () => {
  let controller: PostsController;

  const mockPostsQwRepository = { getByIdOrNotFoundFail: jest.fn(), getAll: jest.fn() };
  const mockCommandBus = { execute: jest.fn() };
  const mockQueryBus = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsQwRepository, useValue: mockPostsQwRepository },
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  afterEach(() => jest.resetAllMocks());

  it('getPostId should call QueryBus and return post', async () => {
    const id = new Types.ObjectId();
    const post = { id: id.toString(), title: 't' };
    mockQueryBus.execute.mockResolvedValue(post);

    const res = await controller.getPostId(id.toString() as any, null);

    expect(mockQueryBus.execute).toHaveBeenCalled();
    expect(res).toEqual(post);
  });
});
