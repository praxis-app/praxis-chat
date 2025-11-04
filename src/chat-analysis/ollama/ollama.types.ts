import { ChatRequest } from 'ollama';

/** Ollama models that are available to use for chat analysis */
export type Model =
  // Small, text only model released by Meta, 1.3GB RAM - https://ollama.com/library/llama3.2:1b
  | 'llama3.2:1b'
  // Small, text only model released by Google, 815MB RAM - https://ollama.com/library/gemma3:1b
  | 'gemma3:1b'
  // Small, text only model released by Google, 1.6GB RAM - https://ollama.com/library/gemma2:2b
  | 'gemma2:2b'
  // Small, text only model released by Alibaba, 986MB RAM - https://ollama.com/library/qwen2.5:1.5b
  | 'qwen2.5:1.5b';

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
