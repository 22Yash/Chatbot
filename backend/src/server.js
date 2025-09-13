import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";


console.log("Groq API Key:", process.env.GROQ_API_KEY);
const PORT = process.env.PORT || 3000;
console.log("STACK_API_KEY: hello ", process.env.CONTENTSTACK_STACK_API_KEY);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
