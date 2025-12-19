import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type LikeStatus = 'Like' | 'Dislike';

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  commentId: string;

  @Prop({
    type: String,
    enum: ['Like', 'Dislike'],
    required: true
  })
  status: LikeStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(
    userId: string,
    commentId: string,
    status: LikeStatus
  ): CommentLikeDocument {
    const like = new this();
    like.userId = userId;
    like.commentId = commentId;
    like.status = status;
    return like as CommentLikeDocument;
  }
}

// 1. Создаем схему
export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

// 2. Загружаем методы класса в схему
CommentLikeSchema.loadClass(CommentLike);

// 3. Добавляем индексы
CommentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

// 4. Типы
export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> & typeof CommentLike;
