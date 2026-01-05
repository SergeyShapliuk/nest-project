import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Session } from '../../domain/session.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SessionService {
  constructor( @InjectRepository(Session)private readonly sessionRepository: Repository<Session>) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createSession(
    userId: string,
    deviceId: string,
    ip: string,
    title: string,
    expiresAt: Date,
  ): Promise<string> {
    // Создаём новую сессию через репозиторий
    const session = this.sessionRepository.create({
      userId,
      deviceId,
      ip,
      title,
      lastActiveDate: new Date(),
      expiresAt,
      // hashedToken: this.hashToken(refreshToken),
    });

    await this.sessionRepository.save(session);
    return session.id; // UUID вместо _id
  }

  async validateToken(userId: string, deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { userId, deviceId, deletedAt: IsNull() },
    });

    if (!session) return null;

    // Обновляем lastActiveDate
    session.lastActiveDate = new Date();
    await this.sessionRepository.save(session);

    return session;
  }

  async deleteSession(userId: string, deviceId: string): Promise<void> {
    await this.sessionRepository.softDelete({ userId, deviceId });
  }

  async deleteAllSessions(userId: string): Promise<void> {
    await this.sessionRepository.softDelete({ userId });
  }
}
