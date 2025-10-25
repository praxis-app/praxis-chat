import { isCommandMessage } from '../commands/commands.service';
import * as messagesService from '../messages/messages.service';
import {
  draftProposal,
  getChatSummary,
  getCompromises,
  getDisagreements,
  isReadyForProposal,
} from './chat-analysis.service';

const MIN_MESSAGE_LIMIT = 3;
const MAX_MESSAGE_LIMIT = 100;

interface CommandContext {
  channelId: string;
  messageBody: string;
}

export const handleSummaryCommand = async (
  context: CommandContext,
): Promise<string> => {
  try {
    const limit = extractLimitParam(context.messageBody);
    const channelMessages = await fetchChannelMessages(
      context.channelId,
      limit,
    );

    const messages = prepareMessages(channelMessages);

    if (messages.length === 0) {
      return 'No messages found in this channel to summarize.';
    }

    const start = Date.now();
    const summary = await getChatSummary({ messages });
    const message = `${summary} (${Date.now() - start}ms)`;

    return message;
  } catch (error) {
    console.error('Error handling summary command', error);
    return 'Sorry, I encountered an error while generating the summary. Please try again.';
  }
};

export const handleConsensusCommand = async (
  context: CommandContext,
): Promise<string> => {
  try {
    const limit = extractLimitParam(context.messageBody);
    const channelMessages = await fetchChannelMessages(
      context.channelId,
      limit,
    );

    const messages = prepareMessages(channelMessages);

    if (messages.length === 0) {
      return 'No messages found in this channel to check for consensus.';
    }

    const start = Date.now();
    const { isReady, reason, error } = await isReadyForProposal({ messages });
    let message = `${isReady ? '✅' : '❌'} - ${reason} (${Date.now() - start}ms)`;
    if (error) {
      message += `\nError: ${error}`;
    }

    return message;
  } catch (error) {
    console.error('Error handling consensus command', error);
    return 'Sorry, I encountered an error while checking for consensus. Please try again.';
  }
};

export const handleDisagreementsCommand = async (
  context: CommandContext,
): Promise<string> => {
  try {
    const limit = extractLimitParam(context.messageBody);
    const channelMessages = await fetchChannelMessages(
      context.channelId,
      limit,
    );

    const messages = prepareMessages(channelMessages);

    if (messages.length === 0) {
      return 'No messages found in this channel to check for disagreements.';
    }

    const start = Date.now();
    const { disagreements, error } = await getDisagreements({ messages });

    const plural = disagreements.length === 1 ? '' : 's';
    const count = `${disagreements.length} disagreement${plural} found`;
    const separator = disagreements.length > 0 ? ':' : '';
    let message = `${count} (${Date.now() - start}ms)${separator}`;

    for (const disagreement of disagreements) {
      message += `\n\n- ${disagreement}`;
    }

    if (error) {
      message += `\nError: ${error}`;
    }

    return message;
  } catch (error) {
    console.error('Error handling disagreements command', error);
    return 'Sorry, I encountered an error while checking for disagreements. Please try again.';
  }
};

export const handleCompromisesCommand = async (
  context: CommandContext,
): Promise<string> => {
  try {
    const limit = extractLimitParam(context.messageBody);
    const channelMessages = await fetchChannelMessages(
      context.channelId,
      limit,
    );

    const messages = prepareMessages(channelMessages);

    if (messages.length === 0) {
      return 'No messages found in this channel to check for compromises.';
    }

    const start = Date.now();
    const { compromises, error } = await getCompromises({ messages });

    const plural = compromises.length === 1 ? '' : 's';
    const count = `${compromises.length} compromise${plural} found`;
    const separator = compromises.length > 0 ? ':' : '';
    let message = `${count} (${Date.now() - start}ms)${separator}`;

    for (const compromise of compromises) {
      message += `\n\n- ${compromise}`;
    }

    if (error) {
      message += `\nError: ${error}`;
    }

    return message;
  } catch (error) {
    console.error('Error handling compromises command', error);
    return 'Sorry, I encountered an error while checking for compromises. Please try again.';
  }
};

export const handleDraftProposalCommand = async (
  context: CommandContext,
): Promise<string> => {
  try {
    const limit = extractLimitParam(context.messageBody);
    const channelMessages = await fetchChannelMessages(
      context.channelId,
      limit,
    );

    const messages = prepareMessages(channelMessages);

    if (messages.length === 0) {
      return 'No messages found in this channel to draft a proposal.';
    }

    const start = Date.now();
    const { title, description, error } = await draftProposal({ messages });
    let message = `[Draft proposal] ${title}\n${description} (${Date.now() - start}ms)`;
    if (error) {
      message += `\nError: ${error}`;
    }

    return message;
  } catch (error) {
    console.error('Error handling draft proposal command', error);
    return 'Sorry, I encountered an error while drafting a proposal. Please try again.';
  }
};

const fetchChannelMessages = async (channelId: string, limit?: number) => {
  const effectiveLimit = limit || MAX_MESSAGE_LIMIT;
  const messages = await messagesService.getMessages(
    channelId,
    0,
    effectiveLimit,
  );
  return messages;
};

/**
 * Filter for text messages, not from the bot, and not a command.
 * Extract sender and body.
 */
const prepareMessages = (
  messages: Awaited<ReturnType<typeof messagesService.getMessages>>,
) =>
  messages
    .reduce(
      (
        result: { sender: string; body: string }[],
        message: (typeof messages)[0],
      ) => {
        if (message.bot || !message.body || !message.user) {
          return result;
        }

        const isCommand = isCommandMessage(message.body);

        if (!isCommand) {
          result.push({
            sender: message.user.name,
            body: message.body,
          });
        }
        return result;
      },
      [] as { sender: string; body: string }[],
    )
    .reverse();

const parseCommand = (messageBody: string) => {
  const parts = messageBody?.trim().split(/\s+/);
  const command = parts?.[0]?.toLowerCase() || '';
  const args = parts?.slice(1) || [];
  return { command, args };
};

const extractLimitParam = (messageBody: string) => {
  const { args } = parseCommand(messageBody);
  const limit = args[0] ? parseInt(args[0]) : undefined;
  if (typeof limit !== 'number') {
    return;
  }
  return Math.min(Math.max(limit, MIN_MESSAGE_LIMIT), MAX_MESSAGE_LIMIT);
};
