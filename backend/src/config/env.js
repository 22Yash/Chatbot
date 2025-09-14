// src/config/env.js
import dotenv from 'dotenv';
import path from 'path';

// Get the absolute path to the .env file in the project's root directory
const envPath = path.resolve(process.cwd(), '../../.env');
dotenv.config({ path: envPath });

export const env = {
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeIndex: process.env.PINECONE_INDEX,
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
  openaiApiKey: process.env.OPENAI_API_KEY,
  embedModel: process.env.PINECONE_EMBED_MODEL || "text-embedding-3-small",
  contentstackStackApiKey: process.env.CONTENTSTACK_STACK_API_KEY,
  contentstackDeliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  contentstackEnvironment: process.env.CONTENTSTACK_ENVIRONMENT,
};