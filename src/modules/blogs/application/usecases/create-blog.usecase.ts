import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string> {
  constructor(
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    console.log('❤️ Execute');

    const blog = await this.blogsRepository.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      // isMembership: dto.isMembership || false,
    });

    return blog.id; // Возвращаем string (UUID) вместо Types.ObjectId
  }
}
