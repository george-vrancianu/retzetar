import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyInstance } from 'fastify';
import request from 'supertest';
import { App } from 'supertest/types';
import { HealthModule } from './../src/health/health.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    app.setGlobalPrefix('api');
    await app.init();
    const fastify = app.getHttpAdapter().getInstance() as FastifyInstance;
    await fastify.ready();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', service: 'retzetar-api' });
  });

  afterEach(async () => {
    await app.close();
  });
});
