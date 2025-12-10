import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    // MailerModule.forRootAsync({
    ConfigModule,
    //     useFactory: (configService: ConfigService) => {
    //
    //       const emailConfig = configService.get('sendMail');
    //
    //       console.log('📧 Email config from ConfigService:', {
    //         authMail: emailConfig?.authMail,
    //         authPass: !!emailConfig?.authPass,
    //       });
    //
    //       return {
    //         // transport: {
    //         //   service: 'gmail',
    //         //   // host: 'smtp.yandex.by',
    //         //   // port: 465, // или 587 для STARTTLS
    //         //   // secure: true, // true для порта 465, false для 587
    //         //   auth: {
    //         //     user: emailConfig.authMail ?? 'sergeshapluk@gmail.com',
    //         //     // user: 'sergeshaplyuk@yandex.by',//'sesrgeshapluk@gmail.com',
    //         //     pass: emailConfig.authPass ?? 'sevp snmt teqs uydm',
    //         //     // pass: 'sofmlasfpizdrozm',//'sevp snmt teqs uydm',
    //         //   },
    //         //   tls: {
    //         //     rejectUnauthorized: false,
    //         //   },
    //         // },
    //         transport: {
    //           // service: 'gmail',
    //           host: 'smtp.sendgrid.net',
    //           port: 587, // или 587 для STARTTLS
    //           secure: false, // true для порта 465, false для 587
    //           auth: {
    //             // user: emailConfig.authMail ?? 'sergeshaplyuk@yandex.ru',//'sergeshapluk@gmail.com',
    //             user: 'apikey',
    //             // pass: emailConfig.authPass ?? 'umfqibewzgoagmlt'//'sevp snmt teqs uydm',
    //             pass: emailConfig.sendGrid,
    //           },
    //           tls: {
    //             rejectUnauthorized: false,
    //           },
    //         },
    //         defaults: {
    //           from: '"No reply" <sergeshapluk@gmail.com>',
    //         },
    //       };
    //     },
    //     inject: [ConfigService],
    //   }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})

export class NotificationsModule {
}
