// import { getLLMResponse } from "../services/providerFactory.js";

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


import { searchEntries } from "../services/contentstackService.js";

export const testContent = async (req, res) => {
  try {
    const data = await searchEntries("tour", {}); // no filters → fetch all
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Contentstack" });
  }
};
