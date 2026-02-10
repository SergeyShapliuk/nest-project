import { Logger, Module } from '@nestjs/common';
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
        // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ
        const logger = new Logger('MailerConfig');
        logger.debug('📧 Полная конфигурация email:');
        logger.debug(`Host: ${emailConfig?.host}`);
        logger.debug(`Port: ${emailConfig?.port}`);
        logger.debug(`User: ${emailConfig?.user}`);
        logger.debug(`Pass: ${emailConfig?.pass ? '*****' : 'NOT SET'}`);
        logger.debug(`Name: ${emailConfig?.name}`);

        // Проверяем обязательные поля
        if (!emailConfig?.host || !emailConfig?.user || !emailConfig?.pass) {
          logger.error('❌ НЕДОСТАЮТ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ КОНФИГУРАЦИИ!');
          throw new Error('Email configuration is incomplete');
        }
        return {
          transport: {
            // service: 'gmail',
            host: emailConfig?.host,
            port: emailConfig?.port,
            secure: false,
            auth: {
              user: emailConfig?.user,
              pass: emailConfig?.pass,
            },
            tls: {
              rejectUnauthorized: false,
            },
            debug: true,
            logger: true,
          },
          defaults: {
            from: `"${emailConfig?.name}" <${emailConfig?.user}>`,
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
