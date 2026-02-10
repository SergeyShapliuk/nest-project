import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Подсхема для информации о комментаторе
@Entity()
export class CommentatorInfo {
  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  userLogin: string;
}

// Подсхема для информации о лайках
@Entity()
export class LikesInfo {
  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  // Можно добавить массивы пользователей, которые лайкнули/дизлайкнули
  // @Prop({ type: [String], default: [] })
  // likes: string[]; // userIds
  //
  // @Prop({ type: [String], default: [] })
  // dislikes: string[]; // userIds
}

@Entity('comments') // createdAt и updatedAt добавятся автоматически
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') // Или 'increment' для числового ID
  id: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column(() => CommentatorInfo)
  commentatorInfo: CommentatorInfo;

  @Column({ type: 'uuid', nullable: false })
  postId: string;

  @Column(() => LikesInfo)
  likesInfo: LikesInfo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  /**
   * Фабричный метод для создания комментария
   */
  static createInstance(
    content: string,
    commentatorInfo: CommentatorInfo,
    postId: string,
  ): Comment {
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

    return comment;
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
