import { Logger } from '@nestjs/common';
import { QueueEvents, Worker } from 'bullmq';

const logger = new Logger('FitHistoryWorker');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  logger.warn('REDIS_URL is not set. Fit history worker will exit.');
  process.exit(0);
}

const queueName = 'fit-history';

const worker = new Worker(
  queueName,
  async (job) => {
    logger.log(`Processing job ${job.id} from queue ${queueName}`);
    logger.debug(JSON.stringify(job.data));
    await Promise.resolve();
  },
  {
    connection: { url: redisUrl },
  },
);

const events = new QueueEvents(queueName, { connection: { url: redisUrl } });

events.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Job ${jobId} failed: ${failedReason}`);
});

events.on('completed', ({ jobId }) => {
  logger.log(`Job ${jobId} completed`);
});

worker.on('ready', () => {
  logger.log('Fit history worker ready');
});

worker.on('error', (error) => {
  logger.error(`Worker error: ${error.message}`);
});
