import { z, toJSONSchema } from 'zod';
import { PromptTemplate } from '../ollama/ollama.types';

export const compromisesSchema = z.object({
  compromises: z.string().array().describe('An array of compromises'),
});

export const COMPROMISES_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify potential compromises in a conversation.

    Rules:
    - Analyze the conversation for disagreements or conflicting preferences
    - If disagreements exist, suggest specific compromise solutions that could satisfy both parties
    - Do NOT just repeat the conflicting statements - generate actual middle-ground solutions
    - Return an empty array if there are no disagreements
    - Return a valid JSON object with no other text

    Example with compromise(s) for scheduling conflict - if someone wants morning and another wants afternoon:
    {
      "compromises": ["Meet at noon", "Schedule for lunch time around 12pm", "Try late morning or early afternoon"]
    }

    Example with no compromises:
    {
      "compromises": []
    }
  `,
  user: 'Analyze this conversation for disagreements and suggest specific compromise solutions:\n{chatData}',
  options: {
    temperature: 0,
    num_predict: 500,
    repeat_penalty: 1.3,
  },
  format: toJSONSchema(compromisesSchema),
};
