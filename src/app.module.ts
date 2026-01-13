import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { SETTINGS } from './core/settings/settings';
import { UserModule } from './modules/users/user.module';
import { CoreModule } from './core/core.module';
import { PostModule } from './modules/posts/post.module';
import { BlogModule } from './modules/blogs/blog.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './modules/testing/testing.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { TestValidationFilter } from './core/exceptions/filters/test-validation.filter';
import configuration from './core/config/configuration';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { configModule } from './config-dynamic-module';
import { CoreConfig } from './core/config/core.config';
import { CommentModule } from './modules/coments/comment.module';

// const mongooseOptions: MongooseModuleAsyncOptions = {
//   imports: [configModule],
//   useFactory: async (coreConfig: CoreConfig) => ({
//     uri: coreConfig.mongoURL,
//   }),
//   inject: [CoreConfig],
// };

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }),
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURL;
        console.log('DB_URI mongo', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),
    // MongooseModule.forRootAsync(mongooseOptions),
    // MongooseModule.forRoot(SETTINGS.MONGO_URL!),
    TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const url = coreConfig.postgresURL;
        console.log('DB_URI postgres', url);
        console.log('DB_URI port', coreConfig.port);

        return {
          type: 'postgres',
          url: url,
          autoLoadEntities: true,
          synchronize: true,
          // logging: true,
        };
      },
      inject: [CoreConfig],
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   url: SETTINGS.POSTGRESQL_URL,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 10000, // 10 секунд (в миллисекундах)
    //       limit: 5,    // 5 запросов
    //     },
    //   ],
    // }),
    UserModule, PostModule, BlogModule, TestingModule, CoreModule, NotificationsModule, CommentModule, configModule],
  controllers: [AppController],
  providers: [AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: TestValidationFilter,
    // },
    //   {
    //   provide: APP_FILTER,
    //   useClass: AllHttpExceptionsFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard, // Глобальный guard
    // },
  ],
})

export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
