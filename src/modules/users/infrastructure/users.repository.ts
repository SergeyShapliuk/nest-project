import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { EmailConfirmation, User } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  // async findById(id: string): Promise<User | null> {
  //   return this.userRepo.findOne({
  //     where: {
  //       id,
  //       deletedAt: IsNull(),
  //     },
  //   });
  // }
  async findById(id: string): Promise<User | null> {
    const query = `
    SELECT * FROM "users" 
    WHERE "id" = $1 
    AND "deleted_at" IS NULL
    LIMIT 1;
  `;

    const result = await this.dataSource.query(query, [id]);
    return result[0] || null;
  }

  async save(user: User): Promise<void> {
    const res = await this.userRepo.save(user);
    console.log('save migration', res);
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: {
        login,
        deletedAt: IsNull(),
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: {
        email,
        deletedAt: IsNull(),
      },
    });
  }

  async findByCode(code: string): Promise<User | null> {
    console.log('findByCode called with code:', code);

    // Вариант 1: Использование embedded entity пути
    const user = await this.userRepo.findOne({
      where: {
        emailConfirmation: {
          confirmationCode: code,
          expirationDate: MoreThan(new Date()),
        },
        deletedAt: IsNull(),
      },
    });

    // Вариант 2: Если хотите использовать QueryBuilder
    // const user = await this.userRepo
    //   .createQueryBuilder('u')
    //   .where('u.emailConfirmationConfirmationCode = :code', { code })
    //   .andWhere('u.emailConfirmationExpirationDate > :now', {
    //     now: new Date(),
    //   })
    //   .andWhere('u.deletedAt IS NULL')
    //   .getOne();

    console.log('findByCode result:', user ? `Found user ${user.id}` : 'Not found');
    return user;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.login = :value OR u.email = :value', {
        value: loginOrEmail,
      })
      .andWhere('u.deletedAt IS NULL')
      .getOne();
  }

  async loginIsExist(login: string): Promise<boolean> {
    const count = await this.userRepo.count({
      where: {
        login,
      },
    });

    return count > 0;
  }
}
