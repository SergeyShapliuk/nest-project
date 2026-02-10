import { UpdatePostDto } from '../dto/update-post.dto';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


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


// ==================== ENTITY (для TypeORM) ====================

// Вложенный объект (Embedded/Value Object)
@Entity()
export class ExtendedLikesInfo {
  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  // constructor(likesCount = 0, dislikesCount = 0) {
  //   this.likesCount = likesCount;
  //   this.dislikesCount = dislikesCount;
  // }
}

// Основная сущность Post
@Entity('posts')
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  shortDescription: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  blogName: string;

  @Column({ type: 'varchar', length: 36, nullable: false }) // uuid length
  blogId: string;

  // Для вложенного объекта в TypeORM используем @Column с type: 'json' или embedded entity
  // Вариант 1: JSON (проще, но менее типобезопасно)
  // @Column({ type: 'json', default: { likesCount: 0, dislikesCount: 0 } })
  // extendedLikesInfo: ExtendedLikesInfo;

  // Вариант 2: Embedded Entity (более типобезопасно)
  @Column(() => ExtendedLikesInfo)
  extendedLikesInfo: ExtendedLikesInfo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Метод для создания экземпляра
  static createInstance(dto: {
    title: string;
    shortDescription: string;
    content: string;
    blogName?: string;
    blogId: string;
  }): Post {
    const post = new Post();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogName = dto?.blogName || '';
    post.blogId = dto.blogId;
    post.extendedLikesInfo = new ExtendedLikesInfo(); // Инициализация с дефолтными значениями

    return post;
  }

  /**
   * Marks the post as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
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
    if (dto.blogId && dto.blogId !== this.blogId) {
      this.blogId = dto.blogId;
    }
  }
}
