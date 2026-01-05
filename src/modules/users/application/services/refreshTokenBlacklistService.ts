import { Inject, Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { BlackList } from '../../domain/blackListToken.entity';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


/**
 * Интерфейс документа в коллекции blacklist
 */
export interface BlacklistedToken {
  token: string;
  userId: string;
  expiresAt: Date; // Mongo TTL требует Date
}

/**
 * Добавить refresh токен в blacklist (например, при logout)
 */
@Injectable()
export class RefreshTokenBlackListService {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    @InjectRepository(BlackList)
    private readonly blackListRepository: Repository<BlackList>,
  ) {
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async addToBlacklist(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    const decoded: any = this.refreshTokenContext.decode(refreshToken);
    if (!decoded?.exp) {
      throw new Error('❌ refreshToken не содержит exp (время истечения)');
    }
    console.log('addToBlacklist', decoded);
    const expiresAt = new Date(decoded.exp * 1000); // exp в секундах
    const blackList = this.blackListRepository.create({ token: refreshToken, userId, expiresAt });
    await this.blackListRepository.save(blackList);
    // await collection.insertOne({ token: refreshToken, userId, expiresAt });
    // const addCollection = await collection.findOne({ token: refreshToken });
    console.log('addCollection', blackList);
  }

  /**
   * Проверка: находится ли токен в blacklist
   */

  async isTokenBlacklisted(
    refreshToken: string,
  ): Promise<boolean> {
    const tokenDoc = await this.blackListRepository.findOne({
      where: { token: refreshToken, deletedAt: IsNull() },
    });
    console.log('isTokenBlacklisted', tokenDoc);
    return !!tokenDoc;
  }

  /**
   * Очистка всех токенов пользователя (например, при смене пароля)
   */

  // async blacklistAllUserTokens(
  //   userId: string,
  //   collection: Collection<BlacklistedToken> = tokenBlacklistCollection,
  // ): Promise<void> {
  //   await collection.deleteMany({ userId });
  // }

  /**
   * Инициализация TTL-индекса (чтобы Mongo удаляла expired токены)
   * Вызывается 1 раз при старте приложения в runDB()
   */

  // ensureTTLIndex(
  //   collection: Collection<BlacklistedToken> = tokenBlacklistCollection
  // ): Promise<void> {
  //     await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  // }
}
