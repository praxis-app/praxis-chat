import { rotateChannelKeysJob } from '../channels/cron/rotate-channel-keys.job';

export const startCronJobs = async () => {
  const cronJobs = [rotateChannelKeysJob];
  for (const cronJob of cronJobs) {
    cronJob.start();
  }
};
