import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlackList } from '../domain/blackListToken.entity';

@Injectable()
export class BlackListRepository {
  constructor(
    @InjectRepository(BlackList)
    private readonly blackListRepository: Repository<BlackList>,
  ) {}

  async findById(token: string): Promise<BlackList | null> {
    console.log('token', token);
    return this.blackListRepository.findOne({
      where: { token, deletedAt: IsNull() },
    });
  }

  async save(newSession: BlackList): Promise<BlackList> {
    return this.blackListRepository.save(newSession);
  }

  async findOrNotFoundFail(token: string): Promise<BlackList> {
    const session = await this.findById(token);
    console.log('No other sessions to findOrNotFoundFail', token);
    if (!session) {
      // TODO: replace with domain exception
      throw new NotFoundException('session not found');
    }
    return session;
  }

  async deleteSessions(userId: string, deviceId: string): Promise<void> {
    const deleteResult = await this.blackListRepository.delete({
      userId,
      deviceId: Not(deviceId), // все кроме текущего устройства
    });

    // безопасная проверка на null/undefined
    if ((deleteResult.affected ?? 0) < 1) {
      console.log('No other sessions to delete');
    }
  }

}
