import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

// Подсхема для информации о комментаторе
@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}

// Подсхема для информации о лайках
@Schema({ _id: false })
export class LikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  // Можно добавить массивы пользователей, которые лайкнули/дизлайкнули
  // @Prop({ type: [String], default: [] })
  // likes: string[]; // userIds
  //
  // @Prop({ type: [String], default: [] })
  // dislikes: string[]; // userIds
}

@Schema({ timestamps: true }) // createdAt и updatedAt добавятся автоматически
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: LikesInfo, default: () => ({
      likesCount: 0,
      dislikesCount: 0,
      // likes: [],
      // dislikes: []
    })})
  likesInfo: LikesInfo;

  // Эти поля добавятся автоматически благодаря timestamps: true
  createdAt: Date;
  updatedAt: Date;

  // Для мягкого удаления
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  // Геттер для id (опционально)
  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  /**
   * Фабричный метод для создания комментария
   */
  static createInstance(
    content: string,
    commentatorInfo: CommentatorInfo,
    postId: string
  ): CommentDocument {
    const comment = new this();

    comment.content = content;
    comment.commentatorInfo = commentatorInfo;
    comment.postId = postId;
    // comment.likesInfo = {
    //   likesCount: 0,
    //   dislikesCount: 0,
    //   // likes: [],
    //   // dislikes: []
    // };

    return comment as CommentDocument;
  }

  /**
   * Обновление комментария
   */
  updateComment(newContent: string) {
    if (newContent !== this.content) {
      this.content = newContent;
    }
  }

  /**
   * Получить статус пользователя (Like/Dislike/None)
   */
  // getUserStatus(userId: string): 'None' | 'Like' | 'Dislike' {
  //   if (this.likesInfo.likes.includes(userId)) {
  //     return 'Like';
  //   }
  //   if (this.likesInfo.dislikes.includes(userId)) {
  //     return 'Dislike';
  //   }
  //   return 'None';
  // }

  /**
   * Мягкое удаление комментария
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Comment already deleted');
    }
    this.deletedAt = new Date();
  }
}

// Создаем схему Mongoose
export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

// Опционально: добавляем индексы для производительности
// CommentSchema.index({ postId: 1 });
// CommentSchema.index({ 'commentatorInfo.userId': 1 });
// CommentSchema.index({ createdAt: -1 });
// CommentSchema.index({ deletedAt: 1 });

// Тип документа Mongoose
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
