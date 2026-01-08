import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity } from 'typeorm';
import { CreatePostLikeDomainDto } from './dto/create-post.like.domain.dto';

@Entity('post_likes')
export class PostLike extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  postId: string;

  @Column({
    type: 'enum',
    enum: ['None', 'Like', 'Dislike'],
    default: 'None',
    nullable: false
  })
  status: 'None' | 'Like' | 'Dislike';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  static createInstance(dto: CreatePostLikeDomainDto): PostLike {
    const postLike = new PostLike();

    postLike.userId = dto.userId;
    postLike.login = dto.login;
    postLike.postId = dto.postId;
    postLike.status = dto.status;

    return postLike;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
