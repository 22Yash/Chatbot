import OpenAI from "openai";
import { pinecone } from "../config/pinecone.js";
import { env } from "../config/env.js";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

// Helper: generate random vector for mock embeddings
function generateMockVector(dim = 1536) {
  return Array(dim).fill(0).map(() => Math.random());
}

export async function embedAndUpsert(id, text) {
  let vector;

  try {
    // Try OpenAI embeddings
    const embedding = await openai.embeddings.create({
      model: env.embedModel,
      input: text,
    });
    vector = embedding.data[0].embedding;
  } catch (err) {
    console.warn("⚠️ OpenAI failed, using mock embedding:", err.message);
    vector = generateMockVector();
  }

  // Upsert into Pinecone
  const index = pinecone.Index(env.pineconeIndex);
  await index.upsert([
    { id, values: vector, metadata: { text } },
  ]);

  console.log(`✅ Upserted vector for: ${id}`);
}

export async function search(query, topK = 3) {
  let vector;

  try {
    const embedding = await openai.embeddings.create({
      model: env.embedModel,
      input: query,
    });
    vector = embedding.data[0].embedding;
  } catch (err) {
    console.warn("⚠️ OpenAI failed, using mock embedding:", err.message);
    vector = generateMockVector();
  }

  const index = pinecone.Index(env.pineconeIndex);
  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return results.matches;
}
