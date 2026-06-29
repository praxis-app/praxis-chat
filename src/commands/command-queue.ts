import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';
import { CommandJobData } from './command.types';

dotenv.config();

export const commandQueueConnection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

export const commandQueuePrefix = 'bullmq';

export const commandQueue = new Queue<CommandJobData>('command-processing', {
  connection: commandQueueConnection,
  prefix: commandQueuePrefix,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
