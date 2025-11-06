/**
 * TODO: Refine prompts and improve chat analysis capabilities
 *
 * This service is responsible for analyzing chat data and generating
 * summaries, proposals, and other insights. It's capabilities are
 * limited and still a work in progress.
 */

import * as ollamaService from './ollama/ollama.service';
import { Model } from './ollama/ollama.types';
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

const CHAT_ANALYSIS_MODEL: Model = 'gemma2:2b';

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

  const content = await ollamaService.executePrompt({
    model: CHAT_ANALYSIS_MODEL,
    template: CHAT_SUMMARY_PROMPT,
    variables: { chatData },
  });

  return content.trim();
};

export const isReadyForProposal = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await ollamaService.executePrompt({
      model: CHAT_ANALYSIS_MODEL,
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

export const getDisagreements = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await ollamaService.executePrompt({
      model: CHAT_ANALYSIS_MODEL,
      template: DISAGREEMENTS_PROMPT,
      variables: { chatData },
    });
    const parsedContent = JSON.parse(content);
    const response = disagreementsSchema.parse(parsedContent);

    return { disagreements: response.disagreements };
  } catch (e) {
    return { disagreements: [], error: JSON.stringify(e) };
  }
};

export const getCompromises = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const chatData = shapeChatData(recentMessages);

  try {
    const content = await ollamaService.executePrompt({
      model: CHAT_ANALYSIS_MODEL,
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
    const content = await ollamaService.executePrompt({
      model: CHAT_ANALYSIS_MODEL,
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

export const loadRequiredModels = async () => {
  await ollamaService.ensureModel(CHAT_ANALYSIS_MODEL);
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
