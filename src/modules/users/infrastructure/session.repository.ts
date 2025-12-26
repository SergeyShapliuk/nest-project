import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { SessionDocument, SessionModelType } from '../domain/session.entity';
import { Session } from '../domain/session.entity';

export interface SessionDevice {
  deviceId: string;
  userId: string;
  ip: string;
  title: string; // из user-agent
  lastActiveDate: Date;
  expiresAt: Date; // ✅ дата окончания токена
  createdAt: Date;
}

@Injectable()
export class SessionRepository {
  constructor(@InjectModel(Session.name) private SessionModel: SessionModelType) {
  }


  async findById(id: string): Promise<SessionDocument | null> {
    console.log('id', id);
    return this.SessionModel.findOne({ deviceId: id, deletedAt: null });
  }

  async save(newSession: SessionDocument) {
    await newSession.save();
  }

  async findOrNotFoundFail(id: string): Promise<SessionDocument> {
    const session = await this.findById(id);

    if (!session) {
      //TODO: replace with domain exception
      throw new NotFoundException('session not found');
    }

    return session;
  }

  async deleteCurrentSession(userId: string, deviceId: string): Promise<void> {
    await this.SessionModel.deleteOne({
      userId,
      deviceId,
    }).exec();
  }


  async deleteSessions(userId: string, deviceId: string): Promise<void> {
    const deleteResult = await this.SessionModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId }, // все кроме текущего устройства
    }).exec();
    if (deleteResult.deletedCount < 1) {
      // Можно не выбрасывать ошибку, если это нормально (нет других сессий)
      console.log('No other sessions to delete');
    }
    return;
  }

  async updateSession(deviceId: string, updateData: Partial<SessionDevice>) {
    await this.SessionModel.updateOne(
      { deviceId },
      { $set: updateData },
    );
  }

}
