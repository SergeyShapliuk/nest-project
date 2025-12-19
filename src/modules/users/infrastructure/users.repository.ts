import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../domain/user.entity';
import { User, UserDocument } from '../domain/user.entity';
import { Types } from 'mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';


@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {
  }


  async findById(id: Types.ObjectId): Promise<UserDocument | null> {
    console.log('id', id);
    return this.UserModel.findOne({ _id: id, deletedAt: null });
  }

  async save(newUser: UserDocument) {
    await newUser.save();
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login });
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email });
  }

  findByCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
      'emailConfirmation.expirationDate': { $gt: new Date() },
    });
  }

  async loginIsExist(login: string): Promise<boolean> {
    return !!(await this.UserModel.countDocuments({ login: login }));
  }

}
