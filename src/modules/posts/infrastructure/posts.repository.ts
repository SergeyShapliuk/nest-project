import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../domain/post.entity';
import { Post,  PostDocument } from '../domain/post.entity';
import { Types } from 'mongoose';


@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {
  }


  async findById(id: string): Promise<PostDocument | null> {
    console.log('id', id);
    return this.PostModel.findOne({ _id: id, deletedAt: null });
  }

  async save(newUser: PostDocument) {
    await newUser.save();
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('post not found');
    }

    return user;
  }

}
