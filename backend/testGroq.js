import 'dotenv/config';

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const chatCompletion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // ✅ valid Groq model
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Tell me a joke about Rome." }
    ],
  });

  console.log(chatCompletion.choices[0].message);
}

main();
