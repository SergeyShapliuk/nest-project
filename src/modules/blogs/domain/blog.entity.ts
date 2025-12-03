import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';


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

// // Схема для вложенного объекта emailConfirmation
// @Schema({ _id: false })
// export class ExtendedLikesInfo {
//   @Prop({ type: Number, required: true, default: 0 })
//   likesCount: number;
//
//   @Prop({ type: Number, required: true, default: 0 })
//   dislikesCount: number;
//
// }
//
// export const ExtendedLikesInfoSchema =
//   SchemaFactory.createForClass(ExtendedLikesInfo);

// Основная схема User
@Schema({ timestamps: true }) // timestamps добавит createdAt и updatedAt автоматически
export class Blog {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

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

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    // blog.isMembership = dto.isMembership;

    return blog as BlogDocument;
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

  updateBlog(dto:UpdateBlogDto) {
    if (dto.name !== this.name) {
      this.name = dto.name;
    }
    if (dto.description !== this.description) {
      this.description = dto.description;
    }
    if (dto.websiteUrl !== this.websiteUrl) {
      this.websiteUrl = dto.websiteUrl;
    }
  }
}

// Создаем схему Mongoose
export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

// Тип документа Mongoose
// Types
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;

