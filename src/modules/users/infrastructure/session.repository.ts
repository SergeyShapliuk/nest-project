import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Session } from '../domain/session.entity';

export interface SessionDevice {
  deviceId: string;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async findById(deviceId: string): Promise<Session | null> {
    return this.sessionRepo.findOne({
      where: {
        deviceId,
        deletedAt: IsNull(),
      },
    });
  }

  async save(session: Session): Promise<void> {
    await this.sessionRepo.save(session);
  }

  async findOrNotFoundFail(deviceId: string): Promise<Session> {
    const session = await this.findById(deviceId);

    if (!session) {
      throw new NotFoundException('session not found');
    }

    return session;
  }

  /**
   * DELETE /security/devices/{deviceId}
   * logout current device
   */
  async deleteCurrentSession(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.sessionRepo.delete({
      userId,
      deviceId,
    });
  }

  /**
   * DELETE /security/devices
   * delete all except current device
   */
  async deleteSessions(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.sessionRepo.delete({
      userId,
      deviceId: Not(deviceId), // ✅ аналог $ne
    });
  }

  /**
   * refresh-token → update lastActiveDate
   */
  async updateSession(
    deviceId: string,
    updateData: Partial<SessionDevice>,
  ): Promise<void> {
    await this.sessionRepo.update(
      { deviceId },
      updateData, // ✅ без $set
    );
  }
}
