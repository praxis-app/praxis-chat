import * as dotenv from 'dotenv';
import { Ollama } from 'ollama';
import { Agent, fetch as undiciFetch } from 'undici';
import { Model, PromptConfig } from './ollama.types';

dotenv.config();

const OLLAMA_HEADERS_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const OLLAMA_BODY_TIMEOUT_MS = 0; // Disable body timeout

const ollama = new Ollama({
  host: `${process.env.OLLAMA_HOST}:${process.env.OLLAMA_PORT}`,

  // Increase fetch timeouts so long-running model pulls don't trigger Undici
  // header/body timeouts. This only affects Ollama requests, not other
  // fetch calls in the application
  fetch: (url, options) => {
    const agent = new Agent({
      headersTimeout: OLLAMA_HEADERS_TIMEOUT_MS,
      bodyTimeout: OLLAMA_BODY_TIMEOUT_MS,
    });
    return undiciFetch(url, { ...options, dispatcher: agent });
  },
});

/**
 * In-memory cache of verified Ollama models
 *
 * This cache prevents redundant model verification checks by storing model names that
 * have already been confirmed to exist locally. Without this cache, we would need to
 * call `ollama.list()` on every request to verify model availability
 *
 * TODO: Consider moving this to Redis
 */
const verifiedModels = new Set<Model>();

export const executePrompt = async ({
  template: { system, user, options, format },
  variables = {},
  model,
}: PromptConfig) => {
  await ensureModel(model);

  // Replace variables in user prompt
  const prompt = Object.entries(variables).reduce(
    (content, [key, value]) => content.replace(`{${key}}`, value),
    user,
  );
  const { response } = await ollama.generate({
    model,
    prompt,
    system,
    options,
    format,
  });

  return response;
};

export const ensureModel = async (model: Model) => {
  // If the model is already verified, bail
  if (verifiedModels.has(model)) {
    return;
  }
  try {
    const models = await ollama.list();
    const modelExists = models.models.some(
      (m) => m.name === model || m.name.startsWith(model + ':'),
    );
    if (!modelExists) {
      const start = Date.now();
      console.info(`Pulling model: ${model}`);
      await ollama.pull({ model: model });

      const duration = Date.now() - start;
      console.info(`Model pulled in ${duration}ms: ${model}`);
    }
    // Always add the model if not already verified
    verifiedModels.add(model);
  } catch (error) {
    console.error('Error checking/pulling model:', error);
    throw error;
  }
};
