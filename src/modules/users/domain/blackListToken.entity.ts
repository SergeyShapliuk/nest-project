import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';


@Schema({ timestamps: true }) // timestamps добавит createdAt и updatedAt автоматически
export class BlackList {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

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
    token: string;
    userId: string;
    expiresAt: Date; // ✅ дата окончания токена
  }): BlackListDocument {
    const blackList = new this();

    blackList.token = dto.token;
    blackList.userId = dto.userId;
    blackList.expiresAt = dto.expiresAt;


    return blackList as BlackListDocument;
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
export const BlackListSchema = SchemaFactory.createForClass(BlackList);
BlackListSchema.loadClass(BlackList);

// Тип документа Mongoose
// Types
export type BlackListDocument = HydratedDocument<BlackList>;
export type BlackListModelType = Model<BlackListDocument> & typeof BlackList;

