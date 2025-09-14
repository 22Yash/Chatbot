import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // ⚠️ use .env, not hardcoded
});

export const groqAdapter = {
  async requestCompletion({ model = "llama-3.1-8b-instant", messages, stream = false, onToken }) {
    const response = await groq.chat.completions.create({
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
      return response.choices[0]?.message;
    }
  },
};

