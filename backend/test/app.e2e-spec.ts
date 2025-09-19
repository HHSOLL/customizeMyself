import type { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

type HealthPayload = {
  status: string;
  timestamp: string;
  version?: string;
};

function isHttpServer(candidate: unknown): candidate is Server {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    'listen' in candidate &&
    typeof (candidate as { listen: unknown }).listen === 'function'
  );
}

function isHealthPayload(payload: unknown): payload is HealthPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    !Array.isArray(payload) &&
    typeof (payload as { status?: unknown }).status === 'string' &&
    typeof (payload as { timestamp?: unknown }).timestamp === 'string'
  );
}

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/health returns ok status', async () => {
    const candidate: unknown = app.getHttpServer();
    if (!isHttpServer(candidate)) {
      throw new Error('Nest application did not return an HTTP server instance');
    }

    const server = candidate;
    const response = await request(server).get('/api/health').expect(200);

    expect(isHealthPayload(response.body)).toBe(true);
    if (!isHealthPayload(response.body)) {
      return;
    }

    expect(response.body.status).toEqual('ok');
    expect(typeof response.body.timestamp).toBe('string');
  });
});
