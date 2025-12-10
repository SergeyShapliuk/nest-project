// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    // private mailerService: MailerService
  ) {
    const apiKey = this.configService.get<string>('sendGrid');
    if (!apiKey) {
      throw new Error('❌ SENDGRID API KEY not found in config');
    }
    sgMail.setApiKey(apiKey);

    this.logger.log('📨 SendGrid initialized');
  }

  // async sendConfirmationEmail(email: string, code: string): Promise<void> {
  //   //can add html templates, implement advertising and other logic for mailing...
  //   await this.mailerService.sendMail({
  //     to: email,
  //     subject: 'Your code is here',
  //     html: `<h1>Thank for your registration</h1>
  //              <p>To finish registration please follow the link below:<br>
  //                 <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
  //             </p>`,
  //   });
  // }
  //
  // async sendRecoveryPassword(email: string, code: string): Promise<void> {
  //   //can add html templates, implement advertising and other logic for mailing...
  //   await this.mailerService.sendMail({
  //     to: email,
  //     subject: 'Your code is here',
  //     html: `<h1>Password recovery</h1>
  //       <p>To finish password recovery please follow the link below:
  //           <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
  //       </p>`,
  //   });
  // }
  async sendConfirmationEmail(email: string, code: string) {
    // const fromEmail = this.configService.get('sendMail.authMail') ?? 'no-reply@yourdomain.com';

    const msg = {
      to: email,
      from: 'sergeshapluk.dev@gmail.com',
      subject: 'Your code is here',
      html: `<h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Email sent to ${email}`);
    } catch (error) {
      this.logger.error('❌ Error sending email', error);

      if (error.response?.body) {
        this.logger.error(error.response.body);
      }

      throw error;
    }
  }

  async sendRecoveryPassword(email: string, code: string) {
    // const fromEmail = this.configService.get('sendMail.authMail') ?? 'no-reply@yourdomain.com';

    const msg = {
      to: email,
      from: 'sergeshapluk.dev@gmail.com',
      subject: 'Your code is here',
      html: `<h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Email sent to ${email}`);
    } catch (error) {
      this.logger.error('❌ Error sending email', error);

      if (error.response?.body) {
        this.logger.error(error.response.body);
      }

      throw error;
    }
  }

  // async sendConfirmationEmail(to: string, code: string) {
  //   return this.sendEmail(
  //     to,
  //     'Confirmation code',
  //     `<h1>Your confirmation code: ${code}</h1>`
  //   );
  // }
}
