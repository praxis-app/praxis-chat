import { PromptTemplate } from '../ollama/ollama.types';

export const CHAT_SUMMARY_PROMPT: PromptTemplate = {
  system: `
    You are a conversation summarizer. Create a very concise summary covering:
    - Main topics discussed
    - Key decisions or conclusions
    - Action items (if any)
    - Unresolved issues
    - Important context

    IMPORTANT: Your summary must be shorter than the original conversation text. Keep it brief and to the point.
    
    Format: Direct summary without labels or prefixes.
  `,
  user: 'Summarize this conversation:\n{chatData}',
  // Decision-making focused options
  options: {
    temperature: 0.1, // Lower creativity
    num_predict: 200, // Limit max tokens
    repeat_penalty: 1.2, // Prevent repetition
    top_k: 20, // Reduce nonsense
  },
};
