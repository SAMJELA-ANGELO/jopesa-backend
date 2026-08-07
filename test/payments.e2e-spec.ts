import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import axios from 'axios';

jest.mock('axios');

describe('Payments (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/payments/initiate (POST)', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { transId: 'T123' } });
    const res = await request(app.getHttpServer()).post('/payments/initiate').send({ amount: 500 });
    expect(res.status).toBe(200);
    expect(res.body.transId || res.body.data?.transId).toBeDefined();
  });
});
