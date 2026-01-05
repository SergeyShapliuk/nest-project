import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_token_blacklist')
@Index(['token'], { unique: true })
@Index(['userId'])
export class BlackList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text', nullable: true })
  deviceId?: string; // <--- добавили поле

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  deletedAt: Date | null;

  /* ========= FACTORY ========= */

  static create(dto: {
    token: string;
    userId: string;
    expiresAt: Date;
    deviceId?: string;
  }): BlackList {
    const entity = new BlackList();

    entity.token = dto.token;
    entity.userId = dto.userId;
    entity.expiresAt = dto.expiresAt;
    entity.deviceId = dto.deviceId;

    return entity;
  }

  /* ========= DOMAIN ========= */

  makeDeleted() {
    if (this.deletedAt) {
      throw new Error('Token already deleted');
    }
    this.deletedAt = new Date();
  }
}
