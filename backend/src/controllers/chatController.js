// src/controllers/chatController.js - DEBUG VERSION

import { fetchAndShapeResults } from '../services/retrievalService.js';
import { 
  getProvider, 
  getFallbackProvider, 
  getModelForProvider,
  getProviderName
} from '../services/providerFactory.js';

import { searchEntries, validateStackCredentials } from '../services/contentstackService.js';

export const sendMessageSSE = async (req, res) => {
  try {
    const { 
      messages, 
      modelProvider = 'groq', // Changed default to groq since that's what you're using
      modelName,
      stackConfig
    } = req.body;

    console.log('🔧 DEBUG: Request received');
    console.log('🔧 Messages length:', messages.length);
    console.log('🔧 Stack config provided:', !!stackConfig);
    console.log('🔧 Model provider:', modelProvider);

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.flushHeaders();

    // --- 1️⃣ Fetch Contentstack results ---
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    console.log('🔧 User message:', lastUserMessage);
    
    const toolMessage = await fetchAndShapeResults(lastUserMessage, stackConfig);
    console.log('🔧 Tool message result:', toolMessage ? 'Found' : 'None');
    
    // Create clean messages array - NO TOOL MESSAGES
    const cleanMessages = messages.map(msg => ({
      role: msg.role === 'tool' ? 'system' : msg.role, // Convert any tool messages to system
      content: msg.content
    }));

    // If we have contentstack results, add them as system context
    if (toolMessage && toolMessage.content) {
      cleanMessages.push({
        role: 'system',
        content: `IMPORTANT: You are a Contentstack-powered chatbot. Use ONLY the following data from the user's content management system to answer questions. Do not provide generic information or advice that's not based on this data:

${toolMessage.content}

Instructions:
- Answer based ONLY on the content above
- If the user asks for something not in the data, say you don't have that information in their Contentstack
- Be concise and focus on the specific tours/content available
- Don't add general travel advice or recommendations beyond what's in the data`
      });

      // Stream tool results to client
      res.write(
        `event: tool_call\ndata: ${JSON.stringify({ content: toolMessage.content })}\n\n`
      );
    }

    console.log('🔧 Final messages count:', cleanMessages.length);
    console.log('🔧 Message roles:', cleanMessages.map(m => m.role));

    // --- 2️⃣ Get LLM provider ---
    let provider = getProvider(modelProvider);
    let hasTriedFallback = false;

    const requestCompletionWithFallback = async (currentProvider) => {
      const mappedModel = getModelForProvider(modelName || 'llama-3.1-8b-instant', getProviderName(currentProvider));
      console.log('🔧 Using model:', mappedModel);

      try {
        await currentProvider.requestCompletion({
          model: mappedModel,
          messages: cleanMessages, // Use clean messages
          stream: true,
          onToken: (token) => {
            res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
          },
          onFinish: () => {
            console.log('🔧 Completion finished');
            res.write(`event: done\ndata: {}\n\n`);
            res.end();
          },
          onError: async (err) => {
            console.error(`❌ ${currentProvider.constructor.name} error:`, err);
            
            // Try fallback logic
            const shouldTryFallback = !hasTriedFallback &&
              (err.code === 'insufficient_quota' ||
               err.status === 429 ||
               err.message?.includes('quota') ||
               err.message?.includes('rate limit'));

            if (shouldTryFallback && currentProvider.constructor.name === 'GroqAdapter') {
              console.log('🔄 Groq quota exceeded, trying OpenAI fallback...');
              hasTriedFallback = true;

              res.write(
                `event: provider_switch\ndata: ${JSON.stringify({ 
                  from: 'Groq',
                  to: 'OpenAI',
                  reason: 'quota_exceeded'
                })}\n\n`
              );

              const fallback = getFallbackProvider('groq');
              await requestCompletionWithFallback(fallback);
            } else {
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

    // --- 3️⃣ Start LLM request ---
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
 */
export const getTours = async (req, res) => {
  try {
    const filters = req.query || {};
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