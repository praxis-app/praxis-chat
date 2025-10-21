import Bull from 'bull';
import * as dotenv from 'dotenv';

dotenv.config();

export interface CommandJobData {
  channelId: string;
  messageBody: string;
  botMessageId: string;
}

export const commandQueue = new Bull<CommandJobData>('command-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
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

export const enqueueCommand = async (data: CommandJobData) => {
  const job = await commandQueue.add(data, {
    priority: 1,
  });
  return job;
};
