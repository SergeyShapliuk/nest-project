import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Types } from 'mongoose';
import { Session } from '../../domain/session.entity';
import type { SessionModelType } from '../../domain/session.entity';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';

@Injectable()
export class SessionsQwRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {
  }

  async getByIdOrNotFoundFail(id: Types.ObjectId, userId?: Types.ObjectId): Promise<SessionsViewDto> {
    const session = await this.SessionModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!session) {
      throw new NotFoundException('session not found');
    }

    return SessionsViewDto.mapToView(session);
  }

  async getAll(userId: string | undefined): Promise<SessionsViewDto[]> {

    const filter: FilterQuery<Session> = {
      userId,
      deletedAt: null,
    };

    // if (orConditions.length > 0) {
    //   filter.$or = orConditions;
    // }
    // const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    // const sortDirectionNumber = queryDto.sortDirection === 'asc' ? 1 : -1;

    const sessions = await this.SessionModel
      .find(filter, {
        projection: {
          _id: 0,
          // deviceId: 1,
          // ip: 1,
          // title: 1,
          // lastActiveDate: 1,
          // expiresAt: 1,
          // createdAt: 1,
        },
      })
      // // .collation({locale: "en", strength: 2})
      .sort({ lastActiveDate: -1 }) // Сортировка по дате активности
      // .skip(queryDto.calculateSkip())
      // .limit(queryDto.pageSize)
      .exec();

    // const totalCount = await this.PostModel.countDocuments(filter);

    return sessions.map(session => SessionsViewDto.mapToView(session));
  }

}
