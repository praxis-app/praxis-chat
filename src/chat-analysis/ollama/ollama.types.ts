import { ChatRequest } from 'ollama';

/** Ollama models that are available to use for chat analysis */
export type Model =
  // Powerful, open source model released by OpenAI - https://ollama.com/library/gpt-oss:20b
  | 'gpt-oss:20b'
  // Lightweight, text only model released by Meta - https://ollama.com/library/llama3.2:3b
  | 'llama3.2:3b'
  // Very small, text only model released by Meta - https://ollama.com/library/llama3.2:1b
  | 'llama3.2:1b'
  // Very small, text only, open source model - https://ollama.com/library/tinyllama:1.1b
  | 'tinyllama:1.1b'
  // Very small, text only model released by Google - https://ollama.com/library/gemma3:1b
  | 'gemma3:1b';

export interface PromptTemplate
  extends Pick<ChatRequest, 'format' | 'options'> {
  system?: string;
  user: string;
}

export interface PromptConfig {
  model: Model;
  template: PromptTemplate;
  variables?: Record<string, string>;
}
