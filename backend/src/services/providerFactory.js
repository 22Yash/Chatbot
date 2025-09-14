// src/services/providers/providerFactory.js
import { openaiAdapter } from "../services/openaiAdapter.js";
import { groqAdapter } from "../services/groqAdapter.js";

export function getProvider(provider) {
  switch (provider) {
    case "openai":
      return openaiAdapter;
    case "groq":
      return groqAdapter;
    default:
      throw new Error("Unsupported provider: " + provider);
  }
}

