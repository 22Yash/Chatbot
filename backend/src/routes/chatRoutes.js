// // src/routes/chatRoutes.js
// import express from "express";
// import { handleChat } from "../controllers/chatController.js";

// const router = express.Router();

// // POST /api/chat
// router.post("/", handleChat);

// export default router;


import express from "express";
import { searchEntries } from "../services/contentstackService.js";
import { testContent } from "../controllers/chatController.js";
const router = express.Router();

// GET /chat/tours?country=India
router.get("/tours", async (req, res) => {
  try {
    const { country } = req.query;
    const tours = await searchEntries("tour", {});
    res.json({ tours });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

router.get("/test-content", testContent);

export default router;
