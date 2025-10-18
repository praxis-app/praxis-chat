import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PromptTemplate } from '../ollama/ollama.types';

export const draftProposalSchema = z.object({
  title: z.string().describe('A short title for the proposal'),
  description: z.string().describe('A short description of the proposal'),
});

export const DRAFT_PROPOSAL_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps draft a proposal based on a discussion.
    The discussion is a list of messages between participants along with some metadata.

    Rules:
    - Carefully track the conversation chronologically to identify the FINAL consensus
    - Pay attention to words like "instead", "rather than", "let's do that" which indicate a change of mind
    - Focus on what participants ultimately agreed on, not initial suggestions that were later changed
    - The title should be concise and include the key subject and decision of the conversation
    - The description should be no more than 2 sentences
    - Return a JSON object with no other text

    Example:
    {
      "title": "Decision: Meet on Tuesdays at 2pm",
      "description": "The team has agreed to meet every Tuesday at 2pm."
    }

  `,
  user: 'Draft a proposal based on this discussion:\n{chatData}',
  format: zodToJsonSchema(draftProposalSchema),
};
