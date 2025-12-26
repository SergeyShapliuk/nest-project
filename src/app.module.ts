import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
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

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }), MongooseModule.forRoot(SETTINGS.MONGO_URL),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000, // 10 секунд (в миллисекундах)
          limit: 5,    // 5 запросов
        },
      ],
    }),
    UserModule, PostModule, BlogModule, TestingModule, CoreModule],
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Глобальный guard
    },
  ],
})
export class AppModule {
}
