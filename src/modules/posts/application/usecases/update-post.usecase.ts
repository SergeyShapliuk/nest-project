import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';


export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const entity = await this.postsRepository.findOrNotFoundFail(id);

    entity.updatePost(dto);

    await this.postsRepository.save(entity);
  }
}
