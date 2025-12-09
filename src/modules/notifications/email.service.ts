import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    await this.mailerService.sendMail({
      text: `confirm registration via link https://somesite.com/confirm-email?code=${code}`,
    });
  }

  async sendRecoveryPassword(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    await this.mailerService.sendMail({
      text: `To finish password recovery please follow the link below https://somesite.com/password-recovery?recoveryCode=${code}`,
    });
  }
}
