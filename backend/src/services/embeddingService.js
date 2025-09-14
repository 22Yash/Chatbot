// src/services/embeddingService.js
import OpenAI from "openai";
import { pinecone } from "../config/pinecone.js";
import { env } from "../config/env.js";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

/**
 * Generate mock vector if OpenAI fails
 */
function generateMockVector(dim = 1536) {
  return Array(dim).fill(0).map(() => Math.random());
}

/**
 * Create embedding for text and upsert into Pinecone
 */
export async function embedAndUpsert(id, text) {
  let vector;

  try {
    const embedding = await openai.embeddings.create({
      model: env.embedModel,
      input: text,
    });
    vector = embedding.data[0].embedding;
  } catch (err) {
    console.warn("⚠️ OpenAI failed, using mock embedding:", err.message);
    vector = generateMockVector();
  }

  const index = pinecone.Index(env.pineconeIndex);
  await index.upsert([
    {
      id,
      values: vector,
      metadata: { text },
    },
  ]);

  console.log(`✅ Upserted vector for: ${id}`);
}

/**
 * Search Pinecone by user query
 */
export async function search(query, topK = 5) {
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

  return results.matches || [];
}

/**
 * Helper: fetch top-K relevant texts as a single string for LLM context
 */
export async function getRelevantTexts(query, topK = 5) {
  const matches = await search(query, topK);
  if (!matches.length) return null;

  return matches
    .map((m, i) => `${i + 1}. ${m.metadata.text}`)
    .join("\n");
}
