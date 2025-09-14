// src/services/openaiAdapter.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiAdapter = {
  async requestCompletion({ model = "gpt-4o-mini", messages, stream = false, onToken }) {
    const response = await client.chat.completions.create({
      model,
      messages,
      stream,
    });

    if (stream) {
      // for await (const chunk of response) {
      //   const token = chunk.choices[0]?.delta?.content || "";
      //   if (token && onToken) onToken(token);
      // }
    } else {
      return response.choices[0].message;
    }
  },
};
