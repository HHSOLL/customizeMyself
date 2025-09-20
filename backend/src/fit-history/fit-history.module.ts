import { Module } from '@nestjs/common';
import { FitHistoryController } from './fit-history.controller';
import { FitHistoryService } from './fit-history.service';

@Module({
  controllers: [FitHistoryController],
  providers: [FitHistoryService],
})
export class FitHistoryModule {}
