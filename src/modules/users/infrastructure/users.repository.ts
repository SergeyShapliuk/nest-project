import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import type { UserModelType } from '../domain/user.entity';
import { User, UserDocument } from '../domain/user.entity';
import { Types } from 'mongoose';


@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {
  }


  async findById(id: string): Promise<UserDocument | null> {
    console.log('id', id);
    return this.UserModel.findOne({ _id: id, deletedAt: null });
  }

  async save(newUser: UserDocument) {
    await newUser.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return user;
  }

  // async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
  //   return userCollection.findOne({
  //     $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
  //   });
  // }
  //
  // async doesExistByLoginOrEmail(
  //   login: string,
  //   email: string,
  // ): Promise<{ exists: boolean; field?: 'login' | 'email' }> {
  //   // Сначала проверяем логин
  //   const existingByLogin = await userCollection.findOne({ login });
  //   if (existingByLogin) {
  //     return { exists: true, field: 'login' };
  //   }
  //
  //   // Затем проверяем email
  //   const existingByEmail = await userCollection.findOne({ email });
  //   if (existingByEmail) {
  //     return { exists: true, field: 'email' };
  //   }
  //
  //   return { exists: false };
  // }
  //
  // async doesExistByEmail(
  //   email: string,
  // ): Promise<{ exists: boolean; field?: 'login' | 'email' }> {
  //   // Затем проверяем email
  //   const existingByEmail = await userCollection.findOne({ email });
  //   if (existingByEmail) {
  //     return { exists: true, field: 'email' };
  //   }
  //
  //   return { exists: false };
  // }
  //
  // async findByConfirmationCode(code: string): Promise<User | null> {
  //   return await userCollection.findOne({
  //     'emailConfirmation.confirmationCode': code,
  //   });
  // }
  //
  // // В usersRepository
  // async confirmEmail(userId: ObjectId): Promise<boolean> {
  //   const result = await userCollection.updateOne(
  //     { _id: userId },
  //     {
  //       $set: {
  //         'emailConfirmation.isConfirmed': true,
  //       },
  //     },
  //   );
  //
  //   return result.modifiedCount === 1;
  // }
  //
  // async updateConfirmationCode(
  //   userId: ObjectId,
  //   newCode: string,
  //   newExpirationDate: string,
  // ): Promise<boolean> {
  //   try {
  //     const result = await userCollection.updateOne(
  //       { _id: userId },
  //       {
  //         $set: {
  //           'emailConfirmation.confirmationCode': newCode,
  //           'emailConfirmation.expirationDate': newExpirationDate,
  //         },
  //       },
  //     );
  //
  //     console.log('Update confirmation code result:', result.modifiedCount);
  //     return result.modifiedCount === 1;
  //   } catch (error) {
  //     console.error('Update confirmation code error:', error);
  //     return false;
  //   }
  // }
  //
  // async updateUserPassword(
  //   userId: ObjectId,
  //   newPassword: string,
  // ): Promise<boolean> {
  //   try {
  //     const result = await userCollection.updateOne(
  //       { _id: userId },
  //       {
  //         $set: {
  //           passwordHash: newPassword,
  //         },
  //       },
  //     );
  //
  //     console.log('Update password result:', result.modifiedCount);
  //     return result.modifiedCount === 1;
  //   } catch (error) {
  //     console.error('Update password error:', error);
  //     return false;
  //   }
  // }
}
