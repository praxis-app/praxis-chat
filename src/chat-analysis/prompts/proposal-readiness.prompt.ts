import { z, toJSONSchema } from 'zod';
import { PromptTemplate } from '../ollama/ollama.types';

export const proposalReadinessSchema = z.object({
  ready: z
    .boolean()
    .describe('Whether the conversation is ready for a proposal'),
  reason: z.string().describe('A short explanation for the readiness'),
});

export const PROPOSAL_READINESS_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify when a discussion is ready for a proposal.

    A conversation is ready for a proposal when:
    - One or more potential solutions or directions have emerged
    - There's some level of agreement or convergence among participants
    - The discussion has reached a natural point where formalizing the decision would be helpful

    A conversation is NOT ready when:
    - The topic is still being explored without any clear direction
    - Participants are still asking clarifying questions
    - There's active disagreement without any convergence

    IMPORTANT: Track the conversation chronologically. Pay special attention to:
    - Words like "instead", "rather than", "actually", "let's do that" which indicate participants changing their minds
    - The FINAL consensus, not initial suggestions that were later abandoned
    - What participants ultimately agreed on at the END of the conversation

    Return a JSON object with no other text:
    - "ready": true/false
    - "reason": a short explanation about readiness AND what was agreed upon, 2 sentences or less

    Example:
    {
      "ready": true,
      "reason": "Consensus reached"
    }
  `,
  user: "Analyze this conversation and determine if it's ready for a proposal:\n{chatData}",
  // Decision-making focused options
  options: {
    temperature: 0.1, // Lower creativity
    repeat_penalty: 1.2, // Prevent repetition
    top_k: 20, // Reduce nonsense
  },
  format: toJSONSchema(proposalReadinessSchema),
};
