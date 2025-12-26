import Bull from 'bull';
import * as dotenv from 'dotenv';
import { CommandJobData } from './command.types';

dotenv.config();

export const commandQueue = new Bull<CommandJobData>('command-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
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
