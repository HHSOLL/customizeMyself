import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok';
  version: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
