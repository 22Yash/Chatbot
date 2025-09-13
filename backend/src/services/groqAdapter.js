import Groq from "groq-sdk";

const groq = new Groq({
  // The API key must be a string, so it needs to be in quotes.
  apiKey: "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",
});

export async function getGroqResponse(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // stable model
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content || "No response";
  } catch (err) {
    console.error("❌ Groq Error:", err.response?.data || err);
    return "Error from Groq API";
  }
}
