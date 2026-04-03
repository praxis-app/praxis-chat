import * as dotenv from 'dotenv';
import { rotateChannelKeysJob } from '../channels/cron/rotate-channel-keys.job';
import * as chatAnalysisService from '../chat-analysis/chat-analysis.service';
import * as commandsService from '../commands/commands.service';
import * as instanceService from '../instance/instance.service';

dotenv.config();

export const initializeApp = async () => {
  if (process.env.ENABLE_LLM_FEATURES === 'true') {
    await chatAnalysisService.loadRequiredModels();
    commandsService.startCommandProcessor();
  }
  await instanceService.initializeInstance();
  startCronJobs();
};

const startCronJobs = () => {
  const cronJobs = [rotateChannelKeysJob];
  for (const cronJob of cronJobs) {
    cronJob.start();
  }
};
