import { z, toJSONSchema } from 'zod';
import { PromptTemplate } from '../ollama/ollama.types';

export const disagreementsSchema = z.object({
  disagreements: z.string().array().describe('An array of disagreements'),
});

// TODO: Examples should be updated - they seem to confuse the model
export const DISAGREEMENTS_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify disagreements in a conversation.

    Rules:
    - Analyze the conversation for disagreements or conflicting preferences
    - Return a valid JSON object with a "disagreements" key that contains an array
      of strings, each representing a disagreement
    - Do NOT just repeat the conflicting statements - describe each disagreement
      in a way that is clear and concise
    - Ensure each entry in the "disagreements" array is a valid sentence or phrase
    - Return an empty array for the "disagreements" key if there are no disagreements

    Example with disagreements:
    {
      "disagreements": [
        "Jane and Sarah disagree on the type of produce to grow.",
        "John and Jane disagree on where to plant the produce."
      ]
    }

    Example with no disagreements:
    {
      "disagreements": []
    }
  `,
  user: 'Identify any disagreements in this conversation:\n{chatData}',
  options: {
    temperature: 0.2, // Very low for consistent JSON
    num_predict: 500, // Enough for multiple disagreements
    top_k: 10, // Narrow choices for structured output
    top_p: 0.8, // Further restrict token selection
  },
  format: toJSONSchema(disagreementsSchema),
};
