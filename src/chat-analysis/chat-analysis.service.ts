/**
 * TODO: Refine prompts and improve chat analysis capabilities
 *
 * This service is responsible for analyzing chat data and generating
 * summaries, proposals, and other insights. It's capabilities are
 * limited and still a work in progress.
 */

import { executePrompt } from './ollama/ollama.service';
import { CHAT_SUMMARY_PROMPT } from './prompts/chat-summary.prompt';
import {
  COMPROMISES_PROMPT,
  compromisesSchema,
} from './prompts/compromises.prompt';
import {
  DISAGREEMENTS_PROMPT,
  disagreementsSchema,
} from './prompts/disagreements.prompt';
import {
  DRAFT_PROPOSAL_PROMPT,
  draftProposalSchema,
} from './prompts/draft-proposal.prompt';
import {
  PROPOSAL_READINESS_PROMPT,
  proposalReadinessSchema,
} from './prompts/proposal-readiness.prompt';

interface Message {
  sender: string;
  body: string;
}

interface Chat {
  messages: Message[];
}

export const getChatSummary = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  const content = await executePrompt({
    model: 'llama3.1:8b',
    template: CHAT_SUMMARY_PROMPT,
    variables: { chatData },
  });

  return content.trim();
};

export const isReadyForProposal = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await executePrompt({
      model: 'mistral:7b',
      template: PROPOSAL_READINESS_PROMPT,
      variables: { chatData },
    });
    const parsedContent = JSON.parse(content);
    const response = proposalReadinessSchema.parse(parsedContent);

    return {
      isReady: response.ready,
      reason: response.reason,
    };
  } catch (e) {
    return {
      error: JSON.stringify(e),
      isReady: null,
      reason: null,
    };
  }
};

// FIXME: This is not working as expected with the gpt-oss:20b model
export const getDisagreements = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await executePrompt({
      model: 'gpt-oss:20b',
      template: DISAGREEMENTS_PROMPT,
      variables: { chatData },
    });
    console.log('Raw model response:', content);
    const parsedContent = JSON.parse(content);
    const response = disagreementsSchema.parse(parsedContent);

    return { disagreements: response.disagreements };
  } catch (e) {
    console.log('Error in getDisagreements:', e);
    return { disagreements: [], error: JSON.stringify(e) };
  }
};

export const getCompromises = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await executePrompt({
      model: 'mistral:7b',
      template: COMPROMISES_PROMPT,
      variables: { chatData },
    });
    const parsedContent = JSON.parse(content);
    const response = compromisesSchema.parse(parsedContent);

    return { compromises: response.compromises };
  } catch (e) {
    return { compromises: [], error: JSON.stringify(e) };
  }
};

export const draftProposal = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await executePrompt({
      model: 'llama3.1:8b',
      template: DRAFT_PROPOSAL_PROMPT,
      variables: { chatData },
    });
    const parsedContent = JSON.parse(content);
    const response = draftProposalSchema.parse(parsedContent);

    return {
      title: response.title,
      description: response.description,
    };
  } catch (e) {
    return {
      title: '',
      description: '',
      error: JSON.stringify(e),
    };
  }
};

const shapeChatData = (messages: Message[]) => {
  const participantCount = new Set(messages.map((m) => m.sender)).size;
  const messageCount = messages.length;

  return JSON.stringify({
    messages,
    participantCount,
    messageCount,
  });
};
