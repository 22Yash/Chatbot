import OpenAI from "openai";

export class OpenAIAdapter {
  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async requestCompletion({ model = "gpt-4o-mini", messages, stream = false, onToken }) {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        stream,
      });

      if (stream) {
        for await (const chunk of response) {
          const token = chunk.choices[0]?.delta?.content || "";
          if (token && onToken) onToken(token);
        }
      } else {
        return response.choices[0].message;
      }
    } catch (err) {
      // Bubble up error for fallback handling
      throw err;
    }
  }
}
