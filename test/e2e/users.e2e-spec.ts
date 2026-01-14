import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { startInMemoryMongo, stopInMemoryMongo } from './setup/mongo-memory.helper';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await startInMemoryMongo();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
    await stopInMemoryMongo();
  });

  it('/users (GET) should return 200', async () => {
    return request(app.getHttpServer()).get('/users').expect(200);
  });
});
