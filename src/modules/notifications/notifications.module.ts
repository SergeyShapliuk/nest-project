import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    // ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const emailConfig = configService.get('sendMail');
        console.log('📧 Email config from ConfigService:', {
          authMail: emailConfig?.user,
          authPass: !!emailConfig?.authPass,
        });
        return {
          transport: {
            // service: 'gmail',
            host: emailConfig?.host,
            port: emailConfig?.port,
            // secure: false,
            auth: {
              user: emailConfig?.user,
              pass: emailConfig?.pass,
            },
            // tls: {
            //   rejectUnauthorized: false,
            // },
          },
          defaults: {
            from: `${emailConfig?.name} <${emailConfig?.user}>`,
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
