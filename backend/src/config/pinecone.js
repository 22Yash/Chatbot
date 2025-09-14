// import dotenv from 'dotenv';
// import path from 'path';
// import { Pinecone } from '@pinecone-database/pinecone';

// // Load .env
// const envPath = path.resolve(process.cwd(), '../../.env');
// dotenv.config({ path: envPath });
// console.log("Loaded .env from:", envPath);


// // Initialize Pinecone client
// export const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY,
//   environment: process.env.PINECONE_ENVIRONMENT,
// });


// src/config/pinecone.js
import { Pinecone } from '@pinecone-database/pinecone';
import { env } from './env.js';

// Verify keys
console.log("PINECONE_API_KEY:", process.env.PINECONE_API_KEY ? '******' : 'undefined');
console.log("PINECONE_ENVIRONMENT:", process.env.PINECONE_ENVIRONMENT);


// Initialize Pinecone client with the centralized env object
export const pinecone = new Pinecone({
  apiKey: env.pineconeApiKey,
  controllerHostUrl: env.pineconeHost,
});