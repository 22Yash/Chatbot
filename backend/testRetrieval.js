import { fetchAndShapeResults, needsData, buildFilters } from './src/services/retrievalService.js';

async function test() {
  const testQueries = [
    "What tours are available for Italy?",
    "Show me tours under ₹50,000 in India",
    "Hello, how are you?",
  ];

  for (const q of testQueries) {
    console.log("=== Query:", q, "===");
    
    // 1️⃣ Intent detection
    console.log("Needs Data?", needsData(q));

    // 2️⃣ Build filters
    console.log("Filters:", buildFilters(q));

    // 3️⃣ Fetch + shape results
    const toolMessage = await fetchAndShapeResults(q);
    console.log("Tool Message:", toolMessage);
    console.log("\n");
  }
}

test().catch(err => console.error(err));
