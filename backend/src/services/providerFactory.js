import { OpenAIAdapter } from './openaiAdapter.js';
import { GroqAdapter } from './groqAdapter.js';

export function getProvider(providerName) {
  switch (providerName?.toLowerCase()) {
    case 'groq':
      return new GroqAdapter();
    case 'openai':
    default:
      return new OpenAIAdapter();
  }
}

// Optional helper for fallback
export function getFallbackProvider(currentProvider) {
  if (currentProvider.toLowerCase() === 'openai') return new GroqAdapter();
  return new OpenAIAdapter();
}
