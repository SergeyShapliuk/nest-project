import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';


export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};


// ==================== SCHEMA (для Mongoose/базы данных) ====================

// Схема для вложенного объекта emailConfirmation
@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, required: true })
  confirmationCode: string;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;

  @Prop({ type: Date, required: true })
  expirationDate: Date; // Используем Date вместо string
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

// Основная схема User
@Schema({ timestamps: true }) // timestamps добавит createdAt и updatedAt автоматически
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  // Эти поля добавятся автоматически благодаря timestamps: true
  createdAt: Date;
  updatedAt: Date;

  // // Для мягкого удаления
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: {
    login: string;
    email: string;
    passwordHash: string;
    confirmationCode: string;
    expirationDate: Date;
  }): UserDocument {
    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.emailConfirmation = {
      confirmationCode: dto.confirmationCode,
      expirationDate: dto.expirationDate,
      isConfirmed: false, // всегда false при создании
    };

    return user as UserDocument;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD сontinue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  confirmEmail() {
    if (this.emailConfirmation.isConfirmed) {
      throw new Error('Email already confirmed');
    }
    this.emailConfirmation.isConfirmed = true;
  }

  updateEmail(newEmail: string, newCode: string, newExpiration: Date) {
    if (newEmail !== this.email) {
      this.email = newEmail;
      this.emailConfirmation = {
        confirmationCode: newCode,
        expirationDate: newExpiration,
        isConfirmed: false,
      };
    }
  }
}

// Создаем схему Mongoose
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

// Тип документа Mongoose
// Types
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;

