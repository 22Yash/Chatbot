// src/services/retrievalService.js
import { searchEntries } from './contentstackService.js';

// === CONFIG / TUNING CONSTANTS ===
const TOP_K = 5;
const SUMMARY_CHAR_LIMIT = 1500;
const INTENT_KEYWORD_WHITELIST = ['tour', 'price', 'book', 'available', 'where', 'show'];

// --- 1️⃣ Intent detection based on keywords ---
export function needsData(userMessage) {
  if (!userMessage) return false;
  const lower = userMessage.toLowerCase();
  return INTENT_KEYWORD_WHITELIST.some(keyword => lower.includes(keyword));
}

// --- 2️⃣ Build filters from user query ---
export function buildFilters(userMessage) {
  const filters = {}; // flat object

  // Country extraction
  const countries = ['Italy', 'France', 'India', 'USA', 'Spain'];
  for (let country of countries) {
    if (userMessage.toLowerCase().includes(country.toLowerCase())) {
      filters.country = country;
      break;
    }
  }

  // Price extraction
  let priceMatch = userMessage.match(/₹\s?([\d,]+)/);
  if (!priceMatch) {
    // "under X" pattern
    const underMatch = userMessage.match(/under\s+([\d,]+)/i);
    if (underMatch) priceMatch = underMatch;
  }

  if (priceMatch) {
    filters.price = parseInt(priceMatch[1].replace(/,/g, '')); // flat
  }

  // Optional: city extraction (look for keywords like "Rome", "Mumbai")
  const cities = ['Rome', 'Mumbai', 'Goa', 'Mahabaleshwar', 'Pune'];
  for (let city of cities) {
    if (userMessage.toLowerCase().includes(city.toLowerCase())) {
      filters.city = city;
      break;
    }
  }

  return filters; // flat object: { city, country, price }
}



// --- 3️⃣ Fetch from Contentstack and shape results ---
export async function fetchAndShapeResults(userMessage) {
  if (!needsData(userMessage)) return null; // No tool call needed

  const filters = buildFilters(userMessage);

  let entries;
  try {
    entries = await searchEntries('tour', filters);
  } catch (err) {
    console.error('❌ Error fetching entries from Contentstack:', err.message);
    return {
      role: 'tool',
      name: 'content.search',
      content: '__TIMEOUT__'
    };
  }

  if (!entries || entries.length === 0) {
    return {
      role: 'tool',
      name: 'content.search',
      content: 'No results found'
    };
  }

  // Shape top-K entries
  const shapedEntries = entries.slice(0, TOP_K)
    .map((e, idx) => {
      const title = e.title || '';
      const city = e.city || '';
      const country = e.country || '';
      const price = e.price ? `₹${e.price}` : '';
      const highlights = e.highlights || e.multi_line || '';
      const url = typeof e.url === 'string' ? e.url : e.url?.href || '';

      return `Result ${idx+1}) ${title} — ${city}, ${country} — ${price} — Highlights: ${highlights}. [View: ${url}]`;
    })
    .join('\n');

  // Truncate to SUMMARY_CHAR_LIMIT
  const finalContent = shapedEntries.length > SUMMARY_CHAR_LIMIT
    ? shapedEntries.slice(0, SUMMARY_CHAR_LIMIT) + '...'
    : shapedEntries;

  return {
    role: 'tool',
    name: 'content.search',
    content: finalContent
  };
}
