import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostLikeDomainDto } from './dto/create-post.like.domain.dto';


@Schema({ timestamps: true }) // timestamps добавит createdAt и updatedAt автоматически
export class PostLike {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, enum: ['None', 'Like', 'Dislike'], default: 'None', required: true })
  status: 'None' | 'Like' | 'Dislike';

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

  static createInstance(dto: CreatePostLikeDomainDto): PostLikeDocument {
    const post = new this();

    post.userId = dto.userId;
    post.login = dto.login;
    post.postId = dto.postId;
    post.status = dto.status;


    return post as PostLikeDocument;
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

  // updatePost(dto: UpdatePostDto) {
  //   if (dto.title !== this.title) {
  //     this.title = dto.title;
  //   }
  //   if (dto.shortDescription !== this.shortDescription) {
  //     this.shortDescription = dto.shortDescription;
  //   }
  //   if (dto.content !== this.content) {
  //     this.content = dto.content;
  //   }
  //   if (dto.blogId !== this.blogId) {
  //     this.blogId = dto.blogId;
  //   }
  // }
}

// Создаем схему Mongoose
export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
PostLikeSchema.loadClass(PostLike);

// Тип документа Mongoose
// Types
export type PostLikeDocument = HydratedDocument<PostLike>;
export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;

