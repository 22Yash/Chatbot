// // src/routes/chatRoutes.js
import express from "express";
import { searchEntries } from "../services/contentstackService.js";
import { sendMessageSSE ,getTours,validateStack } from '../controllers/chatController.js';

const router = express.Router();


router.post('/send', sendMessageSSE);





// GET /chat/tours?country=India
// router.get("/tours", async (req, res) => {
//   try {
//     // grab all query params (not just country)
//     const filters = req.query;  // e.g. { country: "India" }
//     console.log("Filters received:", filters);

//     const tours = await searchEntries("tour", filters);
//     res.json({ tours });
//   } catch (error) {
//     console.error("Error in /chat/tours:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to fetch tours" });
//   }
// });


router.get("/tours", getTours);
// New validation endpoint
router.post('/validate-stack', validateStack);

export default router;
