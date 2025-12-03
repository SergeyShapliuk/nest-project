import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog,  BlogDocument } from '../domain/blog.entity';
import { Types } from 'mongoose';


@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {
  }


  async findById(id: string): Promise<BlogDocument | null> {
    console.log('id', id);
    return this.BlogModel.findOne({ _id: id, deletedAt: null });
  }

  async save(newUser: BlogDocument) {
    await newUser.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('blog not found');
    }

    return blog;
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
