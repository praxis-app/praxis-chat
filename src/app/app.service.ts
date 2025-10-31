import * as dotenv from 'dotenv';
import * as botsService from '../bots/bots.service';
import { rotateChannelKeysJob } from '../channels/cron/rotate-channel-keys.job';
import * as chatAnalysisService from '../chat-analysis/chat-analysis.service';
import * as commandsService from '../commands/commands.service';

dotenv.config();

export const initializeApp = async () => {
  if (process.env.ENABLE_LLM_FEATURES === 'true') {
    await botsService.ensureDefaultBotExists();
    await chatAnalysisService.loadRequiredModels();
    commandsService.startCommandProcessor();
  }
  startCronJobs();
};

const startCronJobs = () => {
  const cronJobs = [rotateChannelKeysJob];
  for (const cronJob of cronJobs) {
    cronJob.start();
  }
};
