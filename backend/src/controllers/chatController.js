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
