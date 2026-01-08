import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {
  }

  async findById(id: string): Promise<Blog | null> {
    console.log('id', id);
    return this.blogRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async save(blog: Blog): Promise<Blog> {
    return this.blogRepository.save(blog);
  }

  async findOrNotFoundFail(id: string): Promise<Blog> {
    const blog = await this.findById(id);

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('blog not found');
    }

    return blog;
  }

  //Дополнительные полезные методы
  async create(dto: {
    name: string;
    description: string;
    websiteUrl: string;
    isMembership?: boolean;
  }): Promise<Blog> {
    const blog = Blog.createInstance(dto);
    return this.blogRepository.save(blog);
  }

  // async update(id: string, updateData: Partial<Blog>): Promise<Blog | null> {
  //   await this.blogRepository.update(id, updateData);
  //   return this.findById(id);
  // }
  //
  // async remove(id: string): Promise<void> {
  //   await this.blogRepository.softDelete(id);
  // }
  //
  // async findAll(): Promise<Blog[]> {
  //   return this.blogRepository.find();
  // }
  //
  // async exists(id: string): Promise<boolean> {
  //   const count = await this.blogRepository.count({
  //     where: { id, deletedAt: null },
  //   });
  //   return count > 0;
  // }
}
