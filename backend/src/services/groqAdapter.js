import Groq from "groq-sdk";

export class GroqAdapter {
  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async requestCompletion({ model = "llama-3.1-8b-instant", messages, stream = false, onToken }) {
    try {
      const response = await this.groq.chat.completions.create({
        model,
        messages,
        stream,
      });

      if (stream) {
        // Uncomment if streaming works
        for await (const chunk of response) {
          const token = chunk.choices[0]?.delta?.content || "";
          if (token && onToken) onToken(token);
        }
      } else {
        return response.choices[0]?.message;
      }
    } catch (err) {
      throw err;
    }
  }
}
