import { ChatRequest } from 'ollama';

/** Ollama models that are currently leveraged by the service. */
export type Model =
  // Open source model released by OpenAI - https://ollama.com/library/gpt-oss:20b
  | 'gpt-oss:20b'
  // "State of the art" model - https://ollama.com/library/llama3.1:8b
  | 'llama3.1:8b'
  //  "Accuracy for sentiment analysis" and runs well on low specs - https://ollama.com/library/mistral:7b
  | 'mistral:7b'
  // A lightweight text only model - https://ollama.com/library/llama3.2:1b
  | 'llama3.2:1b'
  // A very small text only model, runs on a single GPU - https://ollama.com/library/gemma3:1b
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
