import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';



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



/* ==================== EMAIL CONFIRMATION ==================== */

export class EmailConfirmation {
  @Column({ type: 'varchar' })
  confirmationCode: string;

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;
}

/* ==================== USER ENTITY ==================== */

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  login: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  // Embedded object (flat columns in users table)
  @Column(() => EmailConfirmation)
  emailConfirmation: EmailConfirmation;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  /* ==================== DOMAIN METHODS ==================== */

  static createInstance(dto: {
    login: string;
    email: string;
    passwordHash: string;
  }): User {
    const user = new User();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.emailConfirmation = {
      confirmationCode: 'code',
      expirationDate: new Date(),
      isConfirmed: false,
    };

    return user;
  }

  makeDeleted() {
    if (this.deletedAt) {
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

  setCode(code: string, expiration: Date) {
    this.emailConfirmation = {
      confirmationCode: code,
      expirationDate: expiration,
      isConfirmed: false,
    };
  }

  setNewPassword(newHash: string) {
    if (this.passwordHash === newHash) return;
    this.passwordHash = newHash;
  }

  updateEmail(newEmail: string, code: string, expiration: Date) {
    if (this.email !== newEmail) {
      this.email = newEmail;
      this.emailConfirmation = {
        confirmationCode: code,
        expirationDate: expiration,
        isConfirmed: false,
      };
    }
  }
}
