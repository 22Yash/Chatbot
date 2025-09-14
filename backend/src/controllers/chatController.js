// src/controllers/chatController.js

import { handleChatMessage } from '../services/llmService.js';
import { getProvider } from "../services/providerFactory.js";

// export async function handleChat(req, res) {
//   try {
//     const { agentId, message, provider = "openai" } = req.body;

//     const reply = await getLLMResponse(provider, message);

//     res.json({
//       reply,
//       agentId,
//     });
//   } catch (err) {
//     console.error("❌ Chat error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// }

// export const sendMessage = async (req, res) => {
//   try {
//     const { messages, modelProvider, modelName, stackId, locale } = req.body;

//     // Setup SSE (Server-Sent Events)
//     res.writeHead(200, {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection': 'keep-alive'
//     });
//     res.flushHeaders();

//     await handleChatMessage({
//       messages,
//       modelProvider,
//       modelName,
//       stackId,
//       locale,
//       onToken: (token) => {
//         res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
//       }
//     });

//     // Signal completion
//     res.write(`event: done\ndata: {}\n\n`);
//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
//     res.end();
//   }
// };

export const sendMessage = async (req, res) => {
  try {
    const { messages, modelProvider, modelName } = req.body;

    // Get the right adapter (OpenAI / Groq)
    const provider = getProvider(modelProvider);

    // Non-streaming request
    const response = await provider.requestCompletion({
      model: modelName,
      messages,
      stream: false, // 🚫 No streaming
    });

    // Send back normal JSON so Postman can read it
    return res.json({
      provider: modelProvider,
      reply: response.content || response,
    });
  } catch (err) {
    console.error("❌ ChatController Error:", err);
    return res.status(500).json({ error: err.message });
  }
};


import { searchEntries } from "../services/contentstackService.js";

export const getTours = async (req, res) => {
  try {
    // Take filters from query string
    const filters = req.query; // e.g. { Country: "India" }
    const tours = await searchEntries("tour", filters);
    res.json(tours);
  } catch (err) {
    console.error("Error in getTours:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
};
