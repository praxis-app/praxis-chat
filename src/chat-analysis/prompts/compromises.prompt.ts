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
    - For every compromise, explicitly reference the competing preferences or constraints it resolves
      (e.g., different budgets or feature requests) and describe a concrete middle-ground solution
      that satisfies both sides
    - Include actionable specifics (resource splits, alternating ownership, phased rollouts, etc.)
      so the compromise feels implementable
    - Do NOT just repeat the conflicting statements - generate actual middle-ground solutions
    - Ensure each entry in the "compromises" array is a valid sentence or phrase
    - Return an empty array if there are no disagreements
    - Return a valid JSON object with no other text

    IMPORTANT:
    - If there are no realistic compromises, return an empty array for the "compromises" key
    - Avoid including delimiter entries in the "compromises" array, such as ", ", "and", etc

    Example with compromise(s) for scheduling conflict - if someone wants morning and another wants afternoon:
    {
      "compromises": ["Try late morning or early afternoon", "Meet at 11:30am"]
    }

    Example with no compromises:
    {
      "compromises": []
    }
  `,
  user: 'Analyze this conversation for disagreements and suggest specific compromise solutions:\n{chatData}',
  options: {
    temperature: 0.2,
    num_predict: 200,
    repeat_penalty: 1.2,
    top_k: 20,
  },
  format: toJSONSchema(compromisesSchema),
};
