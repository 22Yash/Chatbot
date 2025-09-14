import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

console.log("Groq API Key:", process.env.GROQ_API_KEY);

// Add these:
console.log("Stack API Key: whb", process.env.CONTENTSTACK_STACK_API_KEY);
console.log("Delivery Token:", process.env.CONTENTSTACK_DELIVERY_TOKEN);
console.log("Environment:", process.env.CONTENTSTACK_ENVIRONMENT);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
