import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog,  BlogDocument } from '../domain/blog.entity';
import { Types } from 'mongoose';


@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {
  }


  async findById(id: Types.ObjectId): Promise<BlogDocument | null> {
    console.log('id', id);
    return this.BlogModel.findOne({ _id: id, deletedAt: null });
  }

  async save(newBlog: BlogDocument) {
    await newBlog.save();
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('blog not found');
    }

    return blog;
  }

}
