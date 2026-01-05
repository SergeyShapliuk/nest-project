import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('sessions')
@Index(['userId'])
@Index(['deviceId'], { unique: true })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  deviceId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column({ type: 'timestamptz' })
  lastActiveDate: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  static create(dto: {
    deviceId: string;
    userId: string;
    ip: string;
    title: string;
    lastActiveDate: Date;
    expiresAt: Date;
  }): Session {
    return Object.assign(new Session(), dto);
  }

  updateLastActiveDate(date: Date) {
    this.lastActiveDate = date;
  }

  makeDeleted() {
    if (this.deletedAt) {
      throw new Error('Session already deleted');
    }
    this.deletedAt = new Date();
  }
}
