import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { startInMemoryMongo, stopInMemoryMongo } from './setup/mongo-memory.helper';
import { appSetup } from '../src/setup/app.setup';

jest.setTimeout(30000);

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let AppModule: any;

  beforeAll(async () => {
    await startInMemoryMongo();
    AppModule = require('../src/app.module').AppModule;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await stopInMemoryMongo();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
