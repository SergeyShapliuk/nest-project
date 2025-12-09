import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {

        const emailConfig = configService.get('sendMail');

        console.log('📧 Email config from ConfigService:', {
          authMail: emailConfig?.authMail,
          authPass: !!emailConfig?.authPass,
        });

        return {
          transport: {
            service: 'gmail',
            auth: {
              user: emailConfig.authMail ?? 'sergeshapluk@gmail.com',
              pass: emailConfig.authPass ?? 'sevp snmt teqs uydm',
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: '"No reply" <sergeshapluk@gmail.com>',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {
}
