import { z } from 'zod';
import { PromptTemplate } from '../ollama/ollama.types';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const disagreementsSchema = z.object({
  disagreements: z.string().array().describe('An array of disagreements'),
});

// TODO: Examples should be updated - they seem to confuse the model
export const DISAGREEMENTS_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify disagreements in a conversation.

    Return a JSON object with no other text:
    - "disagreements": An array of strings, each representing a disagreement.
      If there are no disagreements, the array should be empty.

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
    temperature: 0.1, // Very low for consistent JSON
    num_predict: 500, // Enough for multiple disagreements
    top_k: 10, // Narrow choices for structured output
    top_p: 0.8, // Further restrict token selection
  },
  format: zodToJsonSchema(disagreementsSchema),
};
