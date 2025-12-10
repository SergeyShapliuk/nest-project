// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { MailerService } from '@nestjs-modules/mailer';
import nodemailer from 'nodemailer';
import tls from 'tls';


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    // private mailerService: MailerService,
  ) {


    const apiKey = this.configService.get<string>('sendGrid');
    if (!apiKey) {
      throw new Error('❌ SENDGRID API KEY not found in config');
    }
    sgMail.setApiKey(apiKey);

    this.logger.log('📨 SendGrid initialized');
  }

  // async testConnection() {
  //   return new Promise<void>((resolve, reject) => {
  //     const socket = tls.connect(
  //       {
  //         host: 'smtp.yandex.by',
  //         port: 465,
  //         rejectUnauthorized: false,
  //       },
  //       () => {
  //         // этот колбэк вызывается после TCP connect, но TLS handshake может быть не готов
  //       }
  //     );
  //
  //     socket.on('secureConnect', () => {
  //       this.logger.log('✅ Connected to Yandex SMTP (TLS handshake complete)');
  //       socket.end();
  //       resolve();
  //     });
  //
  //     socket.on('error', (err) => {
  //       this.logger.error('❌ Connection error:', err);
  //       reject(err);
  //     });
  //
  //     socket.setTimeout(10000, () => {
  //       this.logger.error('❌ Connection timed out');
  //       socket.destroy();
  //       reject(new Error('Connection timed out'));
  //     });
  //   });
  // }
  //
  //
  //
  // async sendConfirmationEmail(email: string, code: string): Promise<void> {
  //   //can add html templates, implement advertising and other logic for mailing...
  //   console.log('start', email, code);
  //   // await this.testConnection();
  //   console.log('sendConfirmationEmail', email, code);
  //   try {
  //     await this.mailerService.sendMail({
  //       to: email,
  //       subject: 'Your code is here',
  //       html: `<h1>Thank for your registration</h1>
  //              <p>To finish registration please follow the link below:<br>
  //                 <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
  //             </p>`,
  //     });
  //   } catch (e) {
  //     console.log('smtp erro');
  //     throw Error('smtp erro');
  //   }
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
      this.logger.log(`✅ ${JSON.stringify(msg)}`);
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

  //   try {
  //     await sgMail.send(msg);
  //     this.logger.log(`✅ Email sent to ${email}`);
  //   } catch (error) {
  //     this.logger.error('❌ Error sending email', error);
  //
  //     if (error.response?.body) {
  //       this.logger.error(error.response.body);
  //     }
  //
  //     throw error;
  //   }
  // }

  // async sendConfirmationEmail(to: string, code: string) {
  //   return this.sendEmail(
  //     to,
  //     'Confirmation code',
  //     `<h1>Your confirmation code: ${code}</h1>`
  //   );
  }
}
