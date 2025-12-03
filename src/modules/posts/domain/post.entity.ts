import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateBlogDto } from '../../blogs/dto/update-blog.dto';
import { UpdatePostDto } from '../dto/update-post.dto';


export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};


// ==================== SCHEMA (для Mongoose/базы данных) ====================

// Схема для вложенного объекта emailConfirmation
@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

// Основная схема User
@Schema({ timestamps: true }) // timestamps добавит createdAt и updatedAt автоматически
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: String, required: true })
  blogId: string;

  // @Prop({ type: ExtendedLikesInfoSchema, required: true })
  // emailConfirmation: ExtendedLikesInfo;

  // Эти поля добавятся автоматически благодаря timestamps: true
  createdAt: Date;
  updatedAt: Date;

  // // Для мягкого удаления
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: {
    title: string;
    shortDescription: string;
    content: string;
    blogName: string;
    blogId: string;
  }): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogName = dto.blogName;
    post.blogId = dto.blogId;


    return post as PostDocument;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD сontinue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updatePost(dto: UpdatePostDto) {
    if (dto.title !== this.title) {
      this.title = dto.title;
    }
    if (dto.shortDescription !== this.shortDescription) {
      this.shortDescription = dto.shortDescription;
    }
    if (dto.content !== this.content) {
      this.content = dto.content;
    }
    if (dto.blogId !== this.blogId) {
      this.blogId = dto.blogId;
    }
  }
}

// Создаем схему Mongoose
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

// Тип документа Mongoose
// Types
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;

