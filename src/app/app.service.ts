import * as botsService from '../bots/bots.service';
import { rotateChannelKeysJob } from '../channels/cron/rotate-channel-keys.job';
import { startCommandProcessor } from '../commands/command-processor.worker';

export const initializeApp = async () => {
  await botsService.ensureDefaultBotExists();
  startCommandProcessor();
  startCronJobs();
};

const startCronJobs = () => {
  const cronJobs = [rotateChannelKeysJob];
  for (const cronJob of cronJobs) {
    cronJob.start();
  }
};
