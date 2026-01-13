import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Comment } from './comment.entity';

export enum ReactionStatus {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None'
}

@Entity('comment_likes')
@Unique(['user', 'comment'])
@Index(['user', 'comment'])
@Index(['comment', 'status'])
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Comment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ type: 'uuid' })
  commentId: string;

  @Column({
    type: 'enum',
    enum: ReactionStatus,
    default: ReactionStatus.NONE,
  })
  status: 'Like' | 'Dislike' | 'None';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  static createInstance(
    userId: string,
    commentId: string,
    status: ReactionStatus,
  ): CommentLike {
    const like = new this();
    like.userId = userId;
    like.commentId = commentId;
    like.status = status;
    return like as CommentLike;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
