import { Job } from 'bull';
import { handleCommandExecution } from './commands.service';
import { CommandJobData, commandQueue } from './command-queue.service';
import * as messagesService from '../messages/messages.service';

export const startCommandProcessor = () => {
  commandQueue.process(async (job: Job<CommandJobData>) => {
    const { channelId, messageBody, botMessageId } = job.data;

    try {
      const result = await handleCommandExecution({
        channelId,
        messageBody,
      });

      await messagesService.updateBotMessage(botMessageId, {
        body: result,
        commandStatus: 'completed',
      });

      return { success: true, result };
    } catch (error) {
      console.error('Error processing command:', error);

      await messagesService.updateBotMessage(botMessageId, {
        body: 'Sorry, I encountered an error while processing your command. Please try again.',
        commandStatus: 'failed',
      });

      throw error;
    }
  });
};
