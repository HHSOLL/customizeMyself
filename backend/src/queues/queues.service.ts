import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

const FIT_HISTORY_QUEUE = 'fit-history';

@Injectable()
export class QueuesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueuesService.name);
  private fitHistoryQueue: Queue | null = null;

  onModuleInit(): void {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not set. BullMQ queues are disabled.');
      return;
    }

    this.fitHistoryQueue = new Queue(FIT_HISTORY_QUEUE, {
      connection: { url: redisUrl },
    });
    this.logger.log(`Queue ${FIT_HISTORY_QUEUE} initialized`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.fitHistoryQueue?.close();
  }

  async enqueueFitHistory(payload: Record<string, unknown>): Promise<void> {
    if (!this.fitHistoryQueue) {
      this.logger.warn('Fit history queue disabled; job will be skipped.');
      return;
    }

    await this.fitHistoryQueue.add('record', payload, {
      removeOnComplete: 100,
      removeOnFail: 25,
    });
  }

  getHealth(): { queue: string; enabled: boolean } {
    return {
      queue: FIT_HISTORY_QUEUE,
      enabled: Boolean(this.fitHistoryQueue),
    };
  }
}
