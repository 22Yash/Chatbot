import { OpenAIAdapter } from './openaiAdapter.js';
import { GroqAdapter } from './groqAdapter.js';
import { GeminiAdapter } from './geminiAdapter.js';

// Model compatibility mappings
export const MODEL_MAPPINGS = {
  groq: {
    'gpt-4o-mini': 'llama-3.1-8b-instant',
    'gpt-4o': 'llama-3.1-70b-versatile', 
    'gpt-4': 'llama-3.1-70b-versatile',
    'gpt-3.5-turbo': 'llama-3.1-8b-instant',
    'gpt-4-turbo': 'llama-3.1-70b-versatile'
  },
  openai: {
    'llama-3.1-8b-instant': 'gpt-4o-mini',
    'llama-3.1-70b-versatile': 'gpt-4o'
  },
  gemini: { 
    "gpt-4o-mini": "gemini-1.5-flash",
    "gpt-4o": "gemini-1.5-pro"
  }
};

export function getProvider(providerName) {
  switch (providerName?.toLowerCase()) {
    case 'groq':
      return new GroqAdapter();
    case 'gemini':                           // NEW
      return new GeminiAdapter();
    case 'openai':
    default:
      return new OpenAIAdapter();
  }
}

// Get fallback provider with automatic model mapping
export function getFallbackProvider(currentProvider) {
  if (currentProvider.toLowerCase() === 'openai') {
    return new GroqAdapter();
  }
  return new OpenAIAdapter();
}

// Get appropriate model name for a provider
export function getModelForProvider(modelName, providerName) {
  const provider = providerName.toLowerCase();
  
  if (provider === 'groq' && MODEL_MAPPINGS.groq[modelName]) {
    return MODEL_MAPPINGS.groq[modelName];
  }
  
  if (provider === 'openai' && MODEL_MAPPINGS.openai[modelName]) {
    return MODEL_MAPPINGS.openai[modelName];
  }
  
  // Return default models if no mapping found
  const defaults = {
    groq: 'llama-3.1-8b-instant',
    openai: 'gpt-4o-mini'
  };
  
  return defaults[provider] || modelName;
}

// Get provider name from adapter class
export function getProviderName(adapter) {
  if (adapter.constructor.name === 'GroqAdapter') return 'groq';
  if (adapter.constructor.name === 'OpenAIAdapter') return 'openai';
  return 'unknown';
}