// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {


    // const apiKey = this.configService.get<string>('sendGrid');
    // if (!apiKey) {
    //   throw new Error('❌ SENDGRID API KEY not found in config');
    // }
    // sgMail.setApiKey(apiKey);
    //
    // this.logger.log('📨 SendGrid initialized');
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
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    console.log('start', email, code);
    // await this.testConnection();
    console.log('sendConfirmationEmail', email, code);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your code is here',
        html: `<h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`,
        // dkim: {
        //   domainName: 'deveber.site',
        //   keySelector: 'default', // Должен соответствовать _domainkey.default
        //   privateKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtJvWtN1hRaHFZwZFXmzEhlGEuGA8Pfi6qNHExFedkSqHQTsYYaatDN0AyN2dMzAUmgbO+blmbWtOqTRyeSnp65WSiGtykv8OP9STj5E3vRXITeRPQafVL/YAbyrOGxfzisCYNZ/LWx3CbU07QEtP0kz890ZVynJQYjscbfMRaz/d0KGKjIgF5yKajixWnSKVY5dAb886jOnNWaJB+C84DgDGLGnfs8O+4EgtBC22fLcgnqwLh8sDtYukCbgBToEjavLSz6B1BTwh0un7lhB7Ac5KxYxM56A1i5ARrQVC1gAM8dDf7xBtx0c0XJzvy4DbDOTNIieF1mj8BDku82VmgQIDAQAB',
        // },
        // headers: {
        //   'List-Unsubscribe': `<mailto:unsubscribe@deveber.site>`,
        //   'X-Mailer': 'NestJS Mailer',
        //   'X-Priority': '3',
        // },
      });
      console.log('sendConfirmationEmail success',);
    } catch (e) {
      console.log('smtp erro', e);
      throw Error('smtp erro');
    }
  }

  async sendRecoveryPassword(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your code is here',
      html: `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`,
    });
    console.log('sendConfirmationCode success',);
  }

  // async sendConfirmationEmail(email: string, code: string) {
  //   // const fromEmail = this.configService.get('sendMail.authMail') ?? 'no-reply@yourdomain.com';
  //
  //   const msg = {
  //     to: email,
  //     from: 'sergeshapluk.dev@gmail.com',
  //     subject: 'Your code is here',
  //     html: `<h1>Thank for your registration</h1>
  //              <p>To finish registration please follow the link below:<br>
  //                 <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
  //             </p>`,
  //   };
  //
  //   try {
  //     this.logger.log(`✅ ${JSON.stringify(msg)}`);
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
  //
  // async sendRecoveryPassword(email: string, code: string) {
  //   // const fromEmail = this.configService.get('sendMail.authMail') ?? 'no-reply@yourdomain.com';
  //
  //   const msg = {
  //     to: email,
  //     from: 'sergeshapluk.dev@gmail.com',
  //     subject: 'Your code is here',
  //     html: `<h1>Thank for your registration</h1>
  //              <p>To finish registration please follow the link below:<br>
  //                 <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
  //             </p>`,
  //   };

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
  // }
}
