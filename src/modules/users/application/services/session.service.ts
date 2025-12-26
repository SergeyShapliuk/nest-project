import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import type { SessionDocument, SessionModelType } from '../../domain/session.entity';
import { Session } from '../../domain/session.entity';
import { SessionRepository } from '../../infrastructure/session.repository';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly SessionModel: SessionModelType,
    private readonly sessionRepository: SessionRepository,
  ) {
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createSession(
    userId: string,
    deviceId: string,
    // refreshToken: string,
    ip: string,
    title: string,
    expiresAt: Date,
  ): Promise<string> {
    // const hashedToken = this.hashToken(refreshToken);

    const session = this.SessionModel.createInstance({
      userId,
      deviceId,
      ip,
      title,
      lastActiveDate: new Date(),
      expiresAt,
      // hashedToken,
    });

    await this.sessionRepository.save(session);
    return session._id.toString();
  }

  async validateToken(userId: string, deviceId: string, refreshToken: string) {
    // const hashedToken = this.hashToken(refreshToken);

    const session = await this.SessionModel.findOne({ userId, deviceId });

    if (!session) return null;

    // Обновляем lastActiveDate
    session.lastActiveDate = new Date()
    await session.save();

    return session;
  }

  // async deleteSession(userId: string, deviceId: string) {
  //   await this.SessionModel.deleteOne({ userId, deviceId });
  // }

  // async deleteAllSessions(userId: string) {
  //   await this.SessionModel.deleteMany({ userId });
  // }
}
