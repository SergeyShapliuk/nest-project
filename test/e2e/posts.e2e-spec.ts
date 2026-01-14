import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { startInMemoryMongo, stopInMemoryMongo } from '../setup/mongo-memory.helper';
import { appSetup } from '../../src/setup/app.setup';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let AppModule: any;

  beforeAll(async () => {
    await startInMemoryMongo();

    AppModule = require('../../src/app.module').AppModule;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appSetup(app);
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
    await stopInMemoryMongo();
  });

  it('/posts (GET) should return 200', async () => {
    return request(app.getHttpServer()).get('/posts').expect(200);
  });
});
