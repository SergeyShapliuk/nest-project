import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsQwRepository } from '../infrastructure/query/posts.query.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { Post } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { Types } from 'mongoose';

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
    const blog = await this.blogsRepository.findOrNotFoundFail(new Types.ObjectId(dto.blogId));

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

  // async findCommentsByPost(
  //   paginationDto: GetPostsQueryParams,
  //   postId: string,
  //   userId?: string
  // ): Promise<{ items: WithId<Comment>[]; totalCount: number }> {
  //   const post = await this.postsRepository.findByIdOrFail(postId);
  //   return this.postsRepository.findCommentsByPost(
  //     paginationDto,
  //     post._id.toString()
  //   );
  // }
}
