import Bull from 'bull';
import * as dotenv from 'dotenv';
import {
  handleCompromisesCommand,
  handleConsensusCommand,
  handleDisagreementsCommand,
  handleDraftProposalCommand,
  handleSummaryCommand,
} from '../chat-analysis/chat-analysis.commands';
import * as messagesService from '../messages/messages.service';
import { Commands } from './command.constants';
import { CommandContext, CommandJobData } from './command.types';

dotenv.config();

const commandQueue = new Bull<CommandJobData>('command-processing', {
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

export const handleCommandExecution = async (
  context: CommandContext,
): Promise<string> => {
  const commandHandlers: Record<
    Commands,
    (context: CommandContext) => Promise<string>
  > = {
    [Commands.Summary]: handleSummaryCommand,
    [Commands.Consensus]: handleConsensusCommand,
    [Commands.Disagreements]: handleDisagreementsCommand,
    [Commands.Compromises]: handleCompromisesCommand,
    [Commands.DraftProposal]: handleDraftProposalCommand,
  };

  const command = Object.values(Commands).find((command) =>
    context.messageBody?.toLowerCase().startsWith(command),
  );
  if (!command) {
    throw new Error('No valid command found in message');
  }
  return await commandHandlers[command](context);
};

export const startCommandProcessor = () => {
  if (process.env.ENABLE_LLM_FEATURES !== 'true') {
    return;
  }

  commandQueue.process(async (job: Bull.Job<CommandJobData>) => {
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

export const queueCommandJob = async (data: CommandJobData) => {
  const job = await commandQueue.add(data, {
    priority: 1,
  });
  return job;
};

export const isCommandMessage = (body: string) => {
  return Object.values(Commands).some((command) =>
    body?.toLowerCase().startsWith(command),
  );
};
