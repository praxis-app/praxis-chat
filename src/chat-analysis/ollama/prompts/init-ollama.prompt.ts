import { PromptTemplate } from '../ollama.types';

export const INIT_OLLAMA_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that is running on a server.
    You are responsible for delcaring that you have been initialized.
    Each response should be 8 words or less with no new lines.
    Include a sparkly emoji at the end of your response.
  `,
  user: 'What is your status?',
};
