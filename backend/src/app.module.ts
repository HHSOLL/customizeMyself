import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GarmentsModule } from './garments/garments.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { FitHistoryModule } from './fit-history/fit-history.module';
import { SnapshotsModule } from './snapshots/snapshots.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    PrismaModule,
    GarmentsModule,
    MeasurementsModule,
    FitHistoryModule,
    SnapshotsModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
