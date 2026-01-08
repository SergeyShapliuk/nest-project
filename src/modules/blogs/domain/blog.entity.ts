import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn, Entity,
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

@Entity('blogs')
export class Blog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Статический метод для создания экземпляра
  static createInstance(dto: CreateBlogDomainDto): Blog {
    const blog = new Blog();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    // blog.isMembership = dto.isMembership || false;

    return blog;
  }

  /**
   * Marks the blog as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateBlogDto) {
    if (dto.name && dto.name !== this.name) {
      this.name = dto.name;
    }
    if (dto.description && dto.description !== this.description) {
      this.description = dto.description;
    }
    if (dto.websiteUrl && dto.websiteUrl !== this.websiteUrl) {
      this.websiteUrl = dto.websiteUrl;
    }
  }
}
