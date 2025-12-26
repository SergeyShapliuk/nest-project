import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BlackList, BlackListDocument } from '../domain/blackListToken.entity';
import type { BlackListModelType } from '../domain/blackListToken.entity';


@Injectable()
export class BlackListRepository {
  constructor(@InjectModel(BlackList.name) private BlackListModel: BlackListModelType) {
  }


  async findById(id: string): Promise<BlackListDocument | null> {
    console.log('id', id);
    return this.BlackListModel.findOne({ token: id, deletedAt: null });
  }

  async save(newSession: BlackListDocument) {
    await newSession.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlackListDocument> {
    const session = await this.findById(id);
    console.log('No other sessions to findOrNotFoundFail',id);
    if (!session) {
      //TODO: replace with domain exception
      throw new NotFoundException('session not found');
    }

    return session;
  }

  async deleteSessions(userId: string, deviceId: string): Promise<void> {
    const deleteResult = await this.BlackListModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId }, // все кроме текущего устройства
    }).exec();
    if (deleteResult.deletedCount < 1) {
      // Можно не выбрасывать ошибку, если это нормально (нет других сессий)
      console.log('No other sessions to delete');
    }
    return;
  }

}
