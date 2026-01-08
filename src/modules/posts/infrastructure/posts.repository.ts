import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {
  }

  async findById(id: string): Promise<Post | null> {
    console.log('id', id);
    return this.postRepository.findOne({
      where: { id},
    });
  }

  async save(post: Post): Promise<Post> {
    return this.postRepository.save(post);
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return post;
  }

  // posts.repository.ts
  async create(dto: {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName?: string;
  }): Promise<Post> {
    const post = Post.createInstance(dto);
    return this.postRepository.save(post);
  }
}
