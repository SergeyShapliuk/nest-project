import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsQwRepository } from '../infrastructure/query/posts.query.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { Post } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../blogs/dto/update-blog.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private postsQwRepository: PostsQwRepository,
    private blogsRepository: BlogsRepository,
  ) {
  }

  // async findMany(
  //   queryDto: UserQueryInput,
  // ): Promise<{ items: UserDocument[]; totalCount: number }> {
  //   return this.usersQwRepository.findMany(queryDto);
  // }

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);

    console.log('createPost blogname', blog);

    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,

    });
    console.log('createpost', post);
    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
    // создаём метод
    post.updatePost(dto); // change detection

    // await this.blogsRepository.save(blog);

    await this.postsRepository.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
