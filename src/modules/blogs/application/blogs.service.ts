import { Inject, Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQwRepository } from '../infrastructure/query/blogs.query.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog } from '../domain/blog.entity';
import type { BlogModelType } from '../domain/blog.entity';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @Inject(BlogsQwRepository) private blogsQwRepository: BlogsQwRepository,
  ) {
  }

  // async findMany(
  //   queryDto: UserQueryInput,
  // ): Promise<{ items: UserDocument[]; totalCount: number }> {
  //   return this.usersQwRepository.findMany(queryDto);
  // }

  async createBlog(dto: CreateBlogDto): Promise<string> {


    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      // isMembership: true,

    });
    console.log('createpost', blog);
    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
    // создаём метод
    blog.updateBlog(dto); // change detection

    // await this.blogsRepository.save(blog);

    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}
