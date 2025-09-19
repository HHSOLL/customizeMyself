import { Controller, Get } from '@nestjs/common';
import { AppService, type HealthStatus } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  readHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
