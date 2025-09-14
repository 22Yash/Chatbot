import { getProvider } from './providerFactory.js';

export const handleChatMessage = async ({
  messages,
  modelProvider,
  modelName,
  stackId,
  locale,
  onToken
}) => {
  const provider = getProvider(modelProvider);

  // Later (Step 5) you’ll insert MCP retrieval here before provider call
  // e.g. detect intent → fetch content → add tool message

  await provider.requestCompletion({
    model: modelName,
    messages,
    stream: true,
    onToken
  });
};
