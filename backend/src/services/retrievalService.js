// src/services/retrievalService.js
import { searchEntries } from './contentstackService.js';

const TOP_K = 5;
const SUMMARY_CHAR_LIMIT = 1500;

// --- Detect domain ---
function detectContentType(userMessage) {
  const lower = userMessage.toLowerCase();
  if (lower.includes('recipe') || lower.includes('cook') || lower.includes('food') ||
      lower.includes('biryani') || lower.includes('manchurian') || lower.includes('paneer')) {
    return 'recipe';
  }
  return 'tour'; // default
}

// --- Intent check ---
export function needsData(userMessage) {
  if (!userMessage) return false;
  return detectContentType(userMessage) !== null;
}

// --- Build filters ---
export function buildFilters(userMessage) {
  const filters = {};
  const lower = userMessage.toLowerCase();
  const type = detectContentType(userMessage);

  if (type === 'tour') {
    const countries = ['Italy', 'France', 'India', 'USA', 'Spain', 'Japan'];
    for (let c of countries) {
      if (lower.includes(c.toLowerCase())) filters.country = c;
    }

    const cities = ['Rome', 'Mumbai', 'Goa', 'Mahabaleshwar', 'Pune'];
    for (let city of cities) {
      if (lower.includes(city.toLowerCase())) filters.city = city;
    }

    let priceMatch = lower.match(/₹\s?([\d,]+)/);
    if (!priceMatch) {
      const underMatch = lower.match(/under\s+([\d,]+)/i);
      if (underMatch) priceMatch = underMatch;
    }
    if (priceMatch) filters.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }

  if (type === 'recipe') {
    const cuisines = ['indian', 'chinese', 'italian', 'mexican'];
    for (let c of cuisines) {
      if (lower.includes(c)) filters.cuisine = c;
    }
    const dishes = ['veg manchurian', 'vegetable biryani', 'paneer butter masala'];
    for (let dish of dishes) {
      if (lower.includes(dish)) filters.title = dish;
    }
  }

  return filters;
}

// --- Fetch & shape ---
export async function fetchAndShapeResults(userMessage, stackConfig = null) {
  console.log(`[Retrieval] Received: "${userMessage}"`);

  const type = detectContentType(userMessage);
  let filters = buildFilters(userMessage);
  console.log(`[Retrieval] Type: ${type}, Filters:`, filters);

  let entries;
  try {
    entries = await searchEntries(type, filters, stackConfig);
    console.log(`[Retrieval] Got ${entries?.length || 0} ${type} entries`);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    return {
      id: `${type}_error`,
      content: `Sorry, I couldn't fetch ${type} data: ${err.message}`,
    };
  }

  if (!entries || entries.length === 0) {
    return {
      id: `${type}_search`,
      content: `No ${type} results found.`,
    };
  }

  // --- Strict filtering for recipes ---
  if (type === 'recipe') {
    const lowerMsg = userMessage.toLowerCase();

    // More flexible filtering - look for keywords in title, ingredients, or description
    entries = entries.filter(e => {
      const title = (e.title || '').toLowerCase();
      const ingredients = (e.ingredients || '').toLowerCase();
      const description = (e.description || '').toLowerCase();
      const cuisine = (e.cuisine || '').toLowerCase();
      
      // Extract key terms from user message (remove common words like "recipe")
      const terms = lowerMsg.replace(/recipe|food|cook|dish/g, '').trim().split(' ').filter(term => term.length > 2);
      
      // Check if any term matches title, ingredients, description, or cuisine
      return terms.some(term => 
        title.includes(term) || 
        ingredients.includes(term) || 
        description.includes(term) || 
        cuisine.includes(term)
      ) || 
      // If no specific terms, show all recipes of the type
      terms.length === 0;
    });
  }

  if (entries.length === 0) {
    return {
      id: `${type}_search`,
      content: `No ${type} results found for "${userMessage}".`,
    };
  }

  // --- Shape results ---
  const shaped = entries.slice(0, TOP_K).map((e, idx) => {
    if (type === 'tour') {
      // Use the actual field names from your Contentstack data
      const highlights = e.highlights || e.multi_line || '';
      const url = e.url?.href || '';
      return `Result ${idx + 1}) ${e.title} — ${e.city}, ${e.country} — ₹${e.price || 'N/A'} — Highlights: ${highlights}. [View: ${url}]`;
    }
    if (type === 'recipe') {
      const steps = (e.steps || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return `Recipe ${idx + 1}) ${e.title} — Cuisine: ${e.cuisine || 'General'} — Description: ${e.description || ''} — Ingredients: ${e.ingredients || ''} — Steps: ${steps}`;
    }
  }).join('\n');

  // Add instruction to only use this data
  const finalContent = `Available ${type}s in your Contentstack:

${shaped}

END OF DATA - Only use the information above to respond to the user.`;

  return {
    id: `content_${type}`,
    content: finalContent,
  };
}