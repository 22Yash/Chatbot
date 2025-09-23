// src/app.js

import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import embeddingRoutes from "./routes/embeddingRoutes.js";

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001','https://chatbot-0ij7.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/chat", chatRoutes);

app.use("/api/embed", embeddingRoutes);

export default app;
