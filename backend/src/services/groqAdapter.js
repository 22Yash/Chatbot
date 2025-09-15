import Groq from "groq-sdk";

export class GroqAdapter {
  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async requestCompletion({ model = "llama-3.1-8b-instant", messages, stream = false, onToken, onFinish, onError }) {
    try {
      const response = await this.groq.chat.completions.create({
        model,
        messages,
        stream,
      });
  
      if (stream) {
        let sawAnyTokens = false;
        try {
          for await (const chunk of response) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token) {
              sawAnyTokens = true;
              if (onToken) onToken(token);
            }
  
            if (chunk.choices[0]?.finish_reason) {
              if (onFinish) onFinish();
              break;
            }
          }
  
          // ⚠️ If no tokens were streamed, do a non-stream retry
          if (!sawAnyTokens) {
            console.warn("⚠️ Groq stream returned no tokens, retrying in non-stream mode...");
            const fullResponse = await this.groq.chat.completions.create({
              model,
              messages,
              stream: false,
            });
            const result = fullResponse.choices[0]?.message?.content || "";
            if (result && onToken) onToken(result);
            if (onFinish) onFinish();
          }
  
        } catch (streamError) {
          console.error("Groq streaming error:", streamError);
          if (onError) onError(streamError);
        }
      } else {
        const result = response.choices[0]?.message?.content || "";
        if (result && onToken) onToken(result);
        if (onFinish) onFinish();
        return result;
      }
    } catch (err) {
      console.error("Groq adapter error:", err);
      if (onError) onError(err);
    }
  }
  
  
}