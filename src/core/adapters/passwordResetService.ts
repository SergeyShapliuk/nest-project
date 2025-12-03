import { randomUUID } from 'crypto';

interface ResetCode {
  email: string;
  confirmationCode: string;
  expirationDate: string;
  attempts: number;
}

class PasswordResetService {
  private resetCodes: Map<string, ResetCode> = new Map();
  private readonly CODE_EXPIRY = 5 * 60 * 1000; // 5 минут
  private readonly MAX_ATTEMPTS = 25;

  // Генерация и сохранение кода
  async createResetCode(email: string): Promise<string> {
    const confirmationCode = randomUUID();
    const expirationDate = new Date(
      Date.now() + this.CODE_EXPIRY,
    ).toISOString();

    this.resetCodes.set(email, {
      email,
      confirmationCode,
      expirationDate,
      attempts: 0,
    });

    // Автоочистка старых кодов
    this.cleanupExpiredCodes();

    return confirmationCode;
  }

  async getEmailByCode(code: string): Promise<string | null> {
    this.cleanupExpiredCodes();

    for (const [email, resetCode] of this.resetCodes.entries()) {
      if (resetCode.confirmationCode === code) {
        return email;
      }
    }
    return null;
  }

  // Проверка кода
  async verifyCode(email: string, code: string): Promise<boolean> {
    const resetCode = this.resetCodes.get(email);

    if (
      !resetCode ||
      new Date(resetCode.expirationDate).getTime() < Date.now()
    ) {
      return false;
    }

    if (resetCode.attempts >= this.MAX_ATTEMPTS) {
      this.resetCodes.delete(email);
      return false;
    }

    resetCode.attempts++;

    if (resetCode.confirmationCode !== code) {
      return false;
    }

    // Код верный - удаляем его
    this.resetCodes.delete(email);
    return true;
  }

  private cleanupExpiredCodes(): void {
    const now = Date.now();
    for (const [email, code] of this.resetCodes.entries()) {
      if (new Date(code.expirationDate).getTime() < now) {
        this.resetCodes.delete(email);
      }
    }
  }
}

export const passwordResetService = new PasswordResetService();
