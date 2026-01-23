import { ChatRequest } from 'ollama';

/** Ollama models that are available to use for chat analysis */
export type Model =
  // Small, text only model released by Meta - https://ollama.com/library/llama3.2:1b
  | 'llama3.2:1b'
  // Small, text only model released by Alibaba - https://ollama.com/library/qwen:1.8b
  | 'qwen:1.8b'
  // Small, text only model released by Google - https://ollama.com/library/gemma2:2b
  | 'gemma2:2b';

export interface PromptTemplate extends Pick<
  ChatRequest,
  'format' | 'options'
> {
  system?: string;
  user: string;
}

export interface PromptConfig {
  model: Model;
  template: PromptTemplate;
  variables?: Record<string, string>;
}
