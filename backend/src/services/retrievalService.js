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
  
  // Travel/tour related keywords that should trigger data retrieval
  const travelKeywords = ['tour', 'price', 'book', 'available', 'where', 'show', 'visit', 
                          'travel', 'trip', 'destination', 'location', 'city', 'country',
                          'rome', 'mumbai', 'goa', 'pune', 'mahabaleshwar', 'italy', 'india'];
  
  return travelKeywords.some(keyword => lower.includes(keyword));
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
    filters.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }

  // City extraction
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
  console.log(`[Retrieval] Received user message: "${userMessage}"`);

  if (!needsData(userMessage)) {
    console.log("[Retrieval] No data query detected, returning default greeting.");
    return {
      role: 'assistant',
      name: 'default.greeting',
      content: "Hello! How can I help you today? You can ask about tours, prices, or destinations.",
    };
  }

  const filters = buildFilters(userMessage);
  console.log("[Retrieval] Built filters:", filters);

  // Build Contentstack filters (temporarily disable to test)
  const csFilters = {};
  // TODO: Re-enable after fixing case sensitivity in contentstackService.js
  // if (filters.city) csFilters.city = filters.city;
  // if (filters.country) csFilters.country = filters.country;

  let entries;
  try {
    entries = await searchEntries('tour', csFilters);
    console.log(`[Retrieval] Fetched ${entries?.length || 0} entries from Contentstack.`);
  } catch (err) {
    console.error('❌ Error fetching entries from Contentstack:', err.message);
    return {
      role: 'tool',
      name: 'content.search',
      content: '__TIMEOUT__'
    };
  }

  // Initialize filteredEntries with all entries first
  let filteredEntries = entries || [];

  // Apply price filter in code (if present)
  if (filters.price) {
    filteredEntries = filteredEntries.filter(e => {
      if (typeof e.price !== "number") return false;
      return e.price <= filters.price;
    });
    console.log(`[Retrieval] Filtered by price <= ${filters.price}: ${filteredEntries.length} entries remain.`);
  }

  // Apply additional city/country filters if needed (in case CS filters didn't work)
  if (filters.city) {
    filteredEntries = filteredEntries.filter(
      (e) => (e.city || '').toLowerCase().trim() === filters.city.toLowerCase().trim()
    );
  }
  if (filters.country) {
    filteredEntries = filteredEntries.filter(
      (e) => (e.country || '').toLowerCase().trim() === filters.country.toLowerCase().trim()
    );
  }

  if (!filteredEntries || filteredEntries.length === 0) {
    return {
      role: 'tool',
      name: 'content.search',
      content: 'No results found'
    };
  }

  // If user asked for a specific location but we have no location filters matched,
  // and we got all tours back, that means the location doesn't exist
  if (Object.keys(filters).length === 0 && filteredEntries.length > 1) {
    // Check if the query mentions a specific location that's not in our supported list
    const supportedLocations = ['rome', 'mumbai', 'goa', 'mahabaleshwar', 'pune', 'italy', 'india'];
    const queryLower = userMessage.toLowerCase();
    const mentionsUnsupportedLocation = !supportedLocations.some(loc => queryLower.includes(loc));
    
    if (mentionsUnsupportedLocation && queryLower.includes('tour')) {
      return {
        role: 'tool',
        name: 'content.search',
        content: 'No results found'
      };
    }
  }

  // Shape top-K entries (use filteredEntries, not entries!)
  const shapedEntries = filteredEntries.slice(0, TOP_K)
    .map((e, idx) => {
      const title = e.title || '';
      const city = e.city || '';
      const country = e.country || '';
      const price = e.price ? `₹${e.price}` : '';
      const highlights = e.highlights || e.multi_line || '';
      const url = typeof e.url === 'string' ? e.url : (e.url?.href || '');

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