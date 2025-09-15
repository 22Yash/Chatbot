import OpenAI from "openai";

export class OpenAIAdapter {
  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async requestCompletion({ model = "gpt-4o-mini", messages, stream = false, onToken, onFinish, onError }) {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        stream,
      });

      if (stream) {
        try {
          for await (const chunk of response) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token && onToken) {
              onToken(token);
            }
            
            // Check if stream is finished
            if (chunk.choices[0]?.finish_reason) {
              if (onFinish) onFinish();
              break;
            }
          }
        } catch (streamError) {
          console.error('OpenAI streaming error:', streamError);
          if (onError) {
            onError(streamError);
          } else {
            throw streamError;
          }
        }
      } else {
        const result = response.choices[0].message;
        if (onFinish) onFinish();
        return result;
      }
    } catch (err) {
      console.error('OpenAI adapter error:', err);
      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  }
}