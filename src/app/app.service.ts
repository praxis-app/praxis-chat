import { ensureDefaultBotExists } from '../bots/bots.service';
import { rotateChannelKeysJob } from '../channels/cron/rotate-channel-keys.job';

export const initializeApp = async () => {
  await ensureDefaultBotExists();
};

export const startCronJobs = () => {
  const cronJobs = [rotateChannelKeysJob];
  for (const cronJob of cronJobs) {
    cronJob.start();
  }
};
