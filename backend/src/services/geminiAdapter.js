// services/geminiAdapter.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiAdapter {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async requestCompletion({ model = "gemini-1.5-flash", messages, stream = false, onToken, onFinish, onError }) {
    try {
      // Gemini expects text, so join messages
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

      const modelClient = this.client.getGenerativeModel({ model });

      if (stream) {
        const result = await modelClient.generateContentStream(prompt);

        for await (const chunk of result.stream) {
          const token = chunk.text();
          if (token && onToken) {
            onToken(token);
          }
        }

        if (onFinish) onFinish();
      } else {
        const result = await modelClient.generateContent(prompt);
        const text = result.response.text();
        if (onFinish) onFinish();
        return { role: "assistant", content: text };
      }
    } catch (err) {
      console.error("Gemini adapter error:", err);
      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  }
}
