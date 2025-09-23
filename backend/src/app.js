// src/app.js

import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import embeddingRoutes from "./routes/embeddingRoutes.js";

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3001',
    'http://localhost:3000',
    'https://chatbot-0ij7.onrender.com',
    'https://chatbot-rho-liart-17.vercel.app', // Add your Vercel domain
    // You can also use a pattern to match any Vercel preview deployments
    /https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  preflightContinue: false,
  optionsSuccessStatus: 200
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