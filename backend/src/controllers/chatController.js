// src/controllers/chatController.js

import { fetchAndShapeResults } from '../services/retrievalService.js';
import { 
  getProvider, 
  getFallbackProvider, 
  getModelForProvider,
  getProviderName
} from '../services/providerFactory.js';

import { searchEntries, validateStackCredentials } from '../services/contentstackService.js';

/**
 * SSE-based chat endpoint with multi-provider fallback and dynamic stack support
 * Streams both tool (Contentstack) results and LLM tokens
 */
export const sendMessageSSE = async (req, res) => {
  try {
    const { 
      messages, 
      modelProvider = 'openai', 
      modelName,
      stackConfig // New: dynamic stack configuration
    } = req.body;

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.flushHeaders();

    // --- 1️⃣ Fetch Contentstack-based tool results with dynamic config ---
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const toolMessage = await fetchAndShapeResults(lastUserMessage, stackConfig);

    // Append tool results if available
    const finalMessages = [...messages];
    if (toolMessage) {
      const toolCallId = toolMessage.id || 'contentstack_tool';
    
      // 1. Assistant declares tool call
      finalMessages.push({
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: toolCallId,
            type: 'function',
            function: {
              name: 'fetch_contentstack',
              arguments: JSON.stringify({ query: lastUserMessage }),
            },
          },
        ],
      });
    
      // 2. Tool provides result
      finalMessages.push({
        role: 'tool',
        tool_call_id: toolCallId,
        content: toolMessage.content,
      });
    
      // 3. Stream tool results to client
      res.write(
        `event: tool_call\ndata: ${JSON.stringify({ content: toolMessage.content })}\n\n`
      );
    }

    // --- 2️⃣ Get LLM provider adapter ---
    let provider = getProvider(modelProvider);
    let hasTriedFallback = false;

    // Helper to request LLM completion with fallback logic
    const requestCompletionWithFallback = async (currentProvider, isRetry = false) => {
      // Compute mapped model for this provider
      const mappedModel = getModelForProvider(modelName || 'gpt-4o-mini', getProviderName(currentProvider));

      try {
        console.log(`🤖 Using provider: ${currentProvider.constructor.name}`);

        await currentProvider.requestCompletion({
          model: mappedModel,
          messages: finalMessages,
          stream: true,
          onToken: (token) => {
            res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
          },
          onFinish: () => {
            res.write(`event: done\ndata: {}\n\n`);
            res.end();
          },
          onError: async (err) => {
            console.error(`❌ ${currentProvider.constructor.name} error:`, err.message);

            const shouldTryFallback = !hasTriedFallback &&
              (err.code === 'insufficient_quota' ||
               err.status === 429 ||
               err.message?.includes('quota') ||
               err.message?.includes('rate limit'));

            if (shouldTryFallback && currentProvider.constructor.name === 'OpenAIAdapter') {
              console.log('🔄 OpenAI quota exceeded, switching to Groq...');
              hasTriedFallback = true;

              // Send fallback notification to client
              res.write(
                `event: provider_switch\ndata: ${JSON.stringify({ 
                  from: 'OpenAI',
                  to: 'Groq',
                  reason: 'quota_exceeded'
                })}\n\n`
              );

              const fallback = getFallbackProvider('openai');
              await requestCompletionWithFallback(fallback, true);
            } else {
              // No fallback available or fallback also failed
              res.write(
                `event: error\ndata: ${JSON.stringify({ 
                  error: err.message,
                  provider: currentProvider.constructor.name
                })}\n\n`
              );
              res.end();
            }
          },
        });
      } catch (err) {
        console.error('❌ Fatal completion error:', err);
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    };

    // --- 3️⃣ Start LLM request with fallback support ---
    await requestCompletionWithFallback(provider);

  } catch (err) {
    console.error('❌ Chat SSE fatal error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};

/**
 * GET /chat/tours - Fetch tours directly from Contentstack for filters
 * Now supports dynamic stack credentials
 */
export const getTours = async (req, res) => {
  try {
    const filters = req.query || {}; // e.g. { country: "India" }
    
    // Extract stack config from headers or body
    const stackConfig = req.headers['x-stack-config'] 
      ? JSON.parse(req.headers['x-stack-config']) 
      : null;

    const tours = await searchEntries('tour', filters, stackConfig);

    if (!tours || tours.length === 0) {
      return res.status(404).json({ message: 'No tours found for the given filters.' });
    }

    res.json(tours);
  } catch (err) {
    console.error('Error in getTours:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch tours: ' + err.message });
  }
};

/**
 * POST /chat/validate-stack - Validate Contentstack credentials
 */
export const validateStack = async (req, res) => {
  try {
    const { stackApiKey, deliveryToken, environment } = req.body;

    if (!stackApiKey || !deliveryToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required credentials (stackApiKey and deliveryToken)' 
      });
    }

    const stackConfig = {
      stackApiKey,
      deliveryToken,
      environment: environment || 'development'
    };

    const result = await validateStackCredentials(stackConfig);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error('Error validating stack:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during validation',
      message: err.message 
    });
  }
};