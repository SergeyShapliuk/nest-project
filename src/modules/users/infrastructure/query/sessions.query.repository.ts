import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, Not, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../../domain/session.entity';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';

@Injectable()
export class SessionsQwRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async getByIdOrNotFoundFail(id: string, userId?: string): Promise<SessionsViewDto> {
    const session = await this.sessionRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
        ...(userId ? { userId } : {}),
      },
    });

    if (!session) {
      throw new NotFoundException('session not found');
    }

    return SessionsViewDto.mapToView(session);
  }

  async getAll(userId?: string): Promise<SessionsViewDto[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        deletedAt: IsNull(),
        ...(userId ? { userId } : {}),
      },
      order: {
        lastActiveDate: 'DESC', // сортировка по активности
      },
      // select можно указать, если нужны только некоторые поля
      // select: ['deviceId', 'ip', 'title', 'lastActiveDate', 'expiresAt', 'createdAt'],
    });

    return sessions.map(session => SessionsViewDto.mapToView(session));
  }
}
