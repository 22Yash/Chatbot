// src/services/openaiAdapter.js
import OpenAI from "openai";

export async function getOpenAIResponse(userMessage) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ]
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    throw new Error("Failed to fetch response from OpenAI");
  }
}
