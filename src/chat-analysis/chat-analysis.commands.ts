import { isCommandMessage } from '../commands/commands.service';
import { config } from '../config/config';
import { matrixClient } from '../matrix/matrix.client';
import { getMessageBody, isTextMessage } from '../matrix/matrix.utils';
import {
  draftProposal,
  getChatSummary,
  getCompromises,
  getDisagreements,
  isReadyForProposal,
} from './chat-analysis.service';

const MIN_MESSAGE_LIMIT = 3;
const MAX_MESSAGE_LIMIT = 100;

export const handleSummaryCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const limit = extractLimitParam(event);
    const response = await matrixClient.getRoomMessages(roomId, limit);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await matrixClient.sendBotMessage(
        roomId,
        'No messages found in this room to summarize.',
      );
      return;
    }

    console.info('🔍 Fetching chat summary');
    const start = Date.now();
    const summary = await getChatSummary({ messages });
    const message = `${summary} (${Date.now() - start}ms)`;

    await matrixClient.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling summary command', error);
    const roomId = event.room_id as string;
    await matrixClient.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while generating the summary. Please try again.',
    );
  }
};

export const handleConsensusCommand = async (
  event: Record<string, unknown>,
) => {
  try {
    const roomId = event.room_id as string;
    const limit = extractLimitParam(event);
    const response = await matrixClient.getRoomMessages(roomId, limit);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await matrixClient.sendBotMessage(
        roomId,
        'No messages found in this room to check for consensus.',
      );
      return;
    }

    console.info('🔍 Checking for consensus');
    const start = Date.now();
    const { isReady, reason, error } = await isReadyForProposal({ messages });
    let message = `${isReady ? '✅' : '❌'} - ${reason} (${Date.now() - start}ms)`;
    if (error) {
      message += `\nError: ${error}`;
    }

    await matrixClient.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling consensus command', error);
    const roomId = event.room_id as string;
    await matrixClient.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while checking for consensus. Please try again.',
    );
  }
};

export const handleDisagreementsCommand = async (
  event: Record<string, unknown>,
) => {
  try {
    const roomId = event.room_id as string;
    const limit = extractLimitParam(event);
    const response = await matrixClient.getRoomMessages(roomId, limit);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await matrixClient.sendBotMessage(
        roomId,
        'No messages found in this room to check for disagreements.',
      );
      return;
    }

    console.info('🔍 Checking for disagreements');
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

    await matrixClient.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling disagreements command', error);
    const roomId = event.room_id as string;
    await matrixClient.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while checking for disagreements. Please try again.',
    );
  }
};

export const handleCompromisesCommand = async (
  event: Record<string, unknown>,
) => {
  try {
    const roomId = event.room_id as string;
    const limit = extractLimitParam(event);
    const response = await matrixClient.getRoomMessages(roomId, limit);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await matrixClient.sendBotMessage(
        roomId,
        'No messages found in this room to check for compromises.',
      );
      return;
    }

    console.info('🔍 Checking for compromises');
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

    await matrixClient.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling compromises command', error);
    const roomId = event.room_id as string;
    await matrixClient.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while checking for compromises. Please try again.',
    );
  }
};

export const handleDraftProposalCommand = async (
  event: Record<string, unknown>,
) => {
  try {
    const roomId = event.room_id as string;
    const limit = extractLimitParam(event);
    const response = await matrixClient.getRoomMessages(roomId, limit);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await matrixClient.sendBotMessage(
        roomId,
        'No messages found in this room to draft a proposal.',
      );
      return;
    }

    console.info('✍️ Drafting proposal');
    const start = Date.now();
    const { title, description, error } = await draftProposal({ messages });
    let message = `[Draft proposal] ${title}\n${description} (${Date.now() - start}ms)`;
    if (error) {
      message += `\nError: ${error}`;
    }

    await matrixClient.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling draft proposal command', error);
    const roomId = event.room_id as string;
    await matrixClient.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while drafting a proposal. Please try again.',
    );
  }
};

/**
 * Filter for text messages, not from the bot, and not a command.
 * Extract sender and body.
 */
const prepareMessages = (events: Record<string, unknown>[]) =>
  events
    .reduce(
      (
        result: { sender: string; body: string }[],
        event: Record<string, unknown>,
      ) => {
        const body = getMessageBody(event);
        const isText = isTextMessage(event);
        const isBot = event.sender === config.matrix.botName;
        const isCommand = body && isCommandMessage(body);

        if (body && isText && !isBot && !isCommand) {
          result.push({
            sender: event.sender as string,
            body,
          });
        }
        return result;
      },
      [] as { sender: string; body: string }[],
    )
    .reverse();

const parseCommand = (event: Record<string, unknown>) => {
  const body = getMessageBody(event);
  const parts = body?.trim().split(/\s+/);
  const command = parts?.[0]?.toLowerCase() || '';
  const args = parts?.slice(1) || [];
  return { command, args };
};

const extractLimitParam = (event: Record<string, unknown>) => {
  const { args } = parseCommand(event);
  const limit = args[0] ? parseInt(args[0]) : undefined;
  if (typeof limit !== 'number') {
    return;
  }
  return Math.min(Math.max(limit, MIN_MESSAGE_LIMIT), MAX_MESSAGE_LIMIT);
};
