import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';



@Schema({ timestamps: true }) // timestamps добавит createdAt и updatedAt автоматически
export class Session {
  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  // @Prop({ type: String, required: true })
  // hashedToken: string; // sha256(refreshToken)

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
    deviceId: string;
    userId: string;
    ip: string;
    title: string; // из user-agent
    lastActiveDate: Date;
    // hashedToken: string;
    expiresAt: Date; // ✅ дата окончания токена
  }): SessionDocument {
    const session = new this();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.ip = dto.ip;
    session.title = dto.title;
    session.lastActiveDate = dto.lastActiveDate;
    // session.hashedToken = dto.hashedToken;
    session.expiresAt = dto.expiresAt;


    return session as SessionDocument;
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
export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);

// Тип документа Mongoose
// Types
export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & typeof Session;

