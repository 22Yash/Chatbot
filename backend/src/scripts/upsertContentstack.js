// src/scripts/upsertContentstack.js
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch"; // If using Node 18+, fetch is global
import { embedAndUpsert } from "../services/embeddingService.js";
import { env } from "../config/env.js";

async function fetchContentstackEntries() {
    const url = `https://eu-cdn.contentstack.com/v3/content_types/tour/entries?environment=${env.contentstackEnvironment}`;

  const headers = {
    api_key: env.contentstackStackApiKey,
    access_token: env.contentstackDeliveryToken,
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (!data.entries) {
      console.warn("⚠️ No entries found in Contentstack.");
      return [];
    }

    console.log(`📡 Fetched ${data.entries.length} entries from Contentstack.`);
    return data.entries;
  } catch (err) {
    console.error("❌ Error fetching entries from Contentstack:", err);
    return [];
  }
}

async function seedPinecone() {
  console.log("Starting Pinecone upsert process...");

  const entries = await fetchContentstackEntries();
  if (!entries.length) {
    console.warn("⚠️ No entries to upsert.");
    return;
  }

  for (const entry of entries) {
    const text = `${entry.title} — City: ${entry.city}, Country: ${entry.country}, Price: ${entry.price}, Highlights: ${entry.highlights || entry.multi_line || ""}, URL: ${entry.url?.href || ""}`;
    await embedAndUpsert(entry.uid, text);
  }

  console.log("✅ All entries upserted into Pinecone!");
}

seedPinecone().catch(console.error);
