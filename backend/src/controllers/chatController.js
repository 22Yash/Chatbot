// src/controllers/chatController.js

import { fetchAndShapeResults } from '../services/retrievalService.js';
import { getProvider, getFallbackProvider } from '../services/providerFactory.js';
import { searchEntries } from '../services/contentstackService.js';

/**
 * SSE-based chat endpoint with multi-provider fallback
 * Streams both tool (Contentstack) results and LLM tokens
 */
export const sendMessageSSE = async (req, res) => {
  try {
    const { messages, modelProvider = 'openai', modelName } = req.body;

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.flushHeaders();

    // --- 1️⃣ Fetch Contentstack-based tool results ---
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const toolMessage = await fetchAndShapeResults(lastUserMessage);

    // Append tool results if available
    const finalMessages = [...messages];
    if (toolMessage) {
      finalMessages.push(toolMessage);

      // Stream tool message immediately
      res.write(
        `event: tool_call\ndata: ${JSON.stringify({ content: toolMessage.content })}\n\n`
      );
    }

    // --- 2️⃣ Get LLM provider adapter ---
    let provider = getProvider(modelProvider);

    // Helper to request LLM completion with fallback logic
    const requestCompletionWithFallback = async (prov) => {
      try {
        await prov.requestCompletion({
          model: modelName,
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
            console.error('Provider error:', err);

            // If OpenAI quota exceeded, switch to fallback provider (e.g., Groq)
            if (
              (err.code === 'insufficient_quota' || err.status === 429) &&
              prov.constructor.name === 'OpenAIAdapter'
            ) {
              console.log('⚠️ OpenAI quota exceeded, switching to Groq...');
              const fallback = getFallbackProvider('openai');
              await requestCompletionWithFallback(fallback);
            } else {
              res.write(
                `event: provider_error\ndata: ${JSON.stringify({ error: err.message })}\n\n`
              );
              res.end();
            }
          },
        });
      } catch (err) {
        console.error('SSE fatal error:', err);
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    };

    // --- 3️⃣ Start LLM request with fallback support ---
    await requestCompletionWithFallback(provider);

  } catch (err) {
    console.error('❌ Chat SSE error:', err);
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};

/**
 * GET /chat/tours
 * Fetch tours directly from Contentstack for filters (e.g., country)
 */
export const getTours = async (req, res) => {
  try {
    const filters = req.query || {}; // e.g. { country: "India" }
    const tours = await searchEntries('tour', filters);

    if (!tours || tours.length === 0) {
      return res.status(404).json({ message: 'No tours found for the given filters.' });
    }

    res.json(tours);
  } catch (err) {
    console.error('Error in getTours:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
};
