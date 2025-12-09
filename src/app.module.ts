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
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';

@Module({
  imports: [ConfigModule.forRoot(), MongooseModule.forRoot(SETTINGS.MONGO_URL),
    UserModule, PostModule, BlogModule, TestingModule, CoreModule],
  controllers: [AppController],
  providers: [AppService,
    {
    provide: APP_FILTER,
    useClass: AllHttpExceptionsFilter,
  },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    }
    ],
})
export class AppModule {
}
