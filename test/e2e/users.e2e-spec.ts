import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { startInMemoryMongo, stopInMemoryMongo } from '../setup/mongo-memory.helper';
import { appSetup } from '../../src/setup/app.setup';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let createdUserId: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let AppModule: any;

  const adminAuth = 'Basic ' + Buffer.from('admin:qwerty').toString('base64');

  beforeAll(async () => {
    await startInMemoryMongo();

    AppModule = require('../../src/app.module').AppModule;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appSetup(app);
    await app.init();
  }, 80000);

  afterAll(async () => {
    if (app) await app.close();
    await stopInMemoryMongo();
  });

  it('/users (GET) should return 200', async () => {
    return request(app.getHttpServer()).get('/users').expect(200);
  });

  it('/users (POST) should create a user (BasicAuth)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', adminAuth)
      .send({
        login: 'test',
        email: 'test@test.com',
        password: 'test123',
      })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        login: 'test',
        email: 'test@test.com',
      }),
    );

    createdUserId = res.body.id;
  });

  it('/users/:id (GET) should return created user', async () => {
    expect(createdUserId).toBeTruthy();
    return request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .expect(200);
  });

  it('/users/:id (PUT) should update a user', async () => {
    expect(createdUserId).toBeTruthy();
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .send({
        login: 'test2',
        email: 'test2@test.com',
      })
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: createdUserId,
        login: 'test2',
        email: 'test2@test.com',
      }),
    );
  });

  it('/users/:id (DELETE) should delete a user (BasicAuth)', async () => {
    expect(createdUserId).toBeTruthy();
    await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', adminAuth)
      .expect(204);
  });

  it('/users/:id (GET) should return 404 after delete', async () => {
    expect(createdUserId).toBeTruthy();
    return request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .expect(404);
  });
});
