// src/app.js

import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/chat", chatRoutes);


export default app;
