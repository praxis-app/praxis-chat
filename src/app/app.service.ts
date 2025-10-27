import * as botsService from '../bots/bots.service';
import { rotateChannelKeysJob } from '../channels/cron/rotate-channel-keys.job';
import * as commandsService from '../commands/commands.service';

export const initializeApp = async () => {
  await botsService.ensureDefaultBotExists();
  commandsService.startCommandProcessor();
  startCronJobs();
};

const startCronJobs = () => {
  const cronJobs = [rotateChannelKeysJob];
  for (const cronJob of cronJobs) {
    cronJob.start();
  }
};
