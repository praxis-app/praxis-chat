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
      "compromises": ["Let's meet right at noon", "Try late morning or early afternoon", "Meet at 11:30am"]
    }

    Example with no compromises:
    {
      "compromises": []
    }

    IMPORTANT: If there are no realistic compromises, return an empty array for the "compromises" key.
  `,
  user: 'Analyze this conversation for disagreements and suggest specific compromise solutions:\n{chatData}',
  options: {
    temperature: 0.1, // Lower creativity
    num_predict: 200, // Limit max tokens
    repeat_penalty: 1.2, // Prevent repetition
    top_k: 20, // Reduce nonsense
  },
  format: toJSONSchema(compromisesSchema),
};
