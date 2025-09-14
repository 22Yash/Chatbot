
import express from "express";
import { embedAndUpsert, search } from "../services/embeddingService.js";

const router = express.Router();

router.post("/upsert", async (req, res) => {
  const { id, text } = req.body;
  await embedAndUpsert(id, text);
  res.json({ message: "Upserted successfully" });
});

router.get("/search", async (req, res) => {
  const { q } = req.query;
  const results = await search(q);
  res.json(results);
});

export default router;
