// src/services/providers/providerFactory.js
import { getGroqResponse } from "./groqAdapter.js";
import { getOpenAIResponse } from "./openaiAdapter.js";

export function getLLMResponse(provider, message) {
  if (provider === "groq") return getGroqResponse(message);
  if (provider === "openai") return getOpenAIResponse(message);
  throw new Error("Unsupported provider: " + provider);
}
