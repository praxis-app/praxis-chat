import ollama from 'ollama';
import { Model, PromptConfig } from './ollama.types';
import { INIT_OLLAMA_PROMPT } from './prompts/init-ollama.prompt';
import { OLLAMA_HEALTH_PROMPT } from './prompts/ollama-health.prompt';

/**
 * In-memory cache of verified Ollama models.
 *
 * This cache prevents redundant model verification checks by storing
 * model names that have already been confirmed to exist locally.
 * Without this cache, we would need to call `ollama.list()` on every
 * request to verify model availability.
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

const ensureModel = async (model: Model) => {
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

export const getOllamaInitMessage = async () => {
  const start = Date.now();
  const content = await executePrompt({
    model: 'gemma3:1b',
    template: INIT_OLLAMA_PROMPT,
  });

  const end = Date.now();
  const duration = end - start;
  return `Gemma 3 1B: ${content.trim()} - ${duration}ms`;
};

export const getOllamaHealth = async () => {
  const content = await executePrompt({
    model: 'llama3.2:1b',
    template: OLLAMA_HEALTH_PROMPT,
  });
  return content.trim();
};
