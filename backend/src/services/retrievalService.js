import { searchEntries } from './contentstackService.js';

// === CONFIG / TUNING CONSTANTS ===
const TOP_K = 5;
const SUMMARY_CHAR_LIMIT = 1500;
const INTENT_KEYWORD_WHITELIST = ['tour','price','book','available','where','show'];

// --- 1️⃣ Intent detection (MVP keyword rules) ---
export function needsData(userMessage) {
    const lower = userMessage.toLowerCase();
    return INTENT_KEYWORD_WHITELIST.some(keyword => lower.includes(keyword));
}

// --- 2️⃣ Build filters from user query ---
export function buildFilters(userMessage) {
    const filters = { type: 'Tour', filters: {} };

    // Country extraction (basic regex / map)
    const countries = ['Italy','France','India','USA','Spain']; // expand as needed
    for (let country of countries) {
        if (userMessage.toLowerCase().includes(country.toLowerCase())) {
            filters.filters.country = country;
            break;
        }
    }

    // Price extraction (₹ symbol)
    const priceMatch = userMessage.match(/₹\s?([\d,]+)/);
    if (priceMatch) {
        filters.filters.price = { lte: parseInt(priceMatch[1].replace(/,/g,'')) };
    }

    return filters;
}

// --- 3️⃣ Call MCP and shape results ---
export async function fetchAndShapeResults(userMessage) {
    if (!needsData(userMessage)) {
        return null; // no content needed
    }

    const filters = buildFilters(userMessage);

    let entries;
    try {
        entries = await searchEntries('tour', filters.filters);
    } catch (err) {
        console.error('Error fetching MCP entries:', err.message);
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
            content: 'No results'
        };
    }

    // Shape top-K entries into short snippets
    const shapedEntries = entries.slice(0, TOP_K)
        .map((e, idx) => {
            const title = e.title || '';
            const city = e.city || '';
            const country = e.country || '';
            const price = e.price ? `₹${e.price}` : '';
            const highlights = e.highlights || '';
            const url = e.url || '';
            return `Result ${idx+1}) ${title} — ${city}, ${country} — ${price} — Highlights: ${highlights}. [View: ${url}]`;
        })
        .join('\n');

    // truncate to SUMMARY_CHAR_LIMIT
    const finalContent = shapedEntries.length > SUMMARY_CHAR_LIMIT
        ? shapedEntries.slice(0, SUMMARY_CHAR_LIMIT) + '...'
        : shapedEntries;

    return {
        role: 'tool',
        name: 'content.search',
        content: finalContent
    };
}
