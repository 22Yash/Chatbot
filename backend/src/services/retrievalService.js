// src/services/retrievalService.js
import { searchEntries } from './contentstackService.js';

// === CONFIG / TUNING CONSTANTS ===
const TOP_K = 5;
const SUMMARY_CHAR_LIMIT = 1500;

// --- Helper function to detect content type from user query ---
function detectContentType(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  if (
    lowerMessage.includes('recipe') ||
    lowerMessage.includes('cook') ||
    lowerMessage.includes('food') ||
    lowerMessage.includes('biryani') ||
    lowerMessage.includes('manchurian')
  ) {
    return 'recipe';
  }

  // Default to tour if nothing else matched
  return 'tour';
}

// --- 1️⃣ Intent detection based on keywords ---
export function needsData(userMessage) {
  if (!userMessage) return false;
  const lower = userMessage.toLowerCase();

  // Directly check if a content type is detected
  const contentType = detectContentType(lower);
  if (contentType !== 'tour') {
    return true;
  }

  // Travel/tour and recipe keywords
  const travelKeywords = [
    'tour', 'price', 'book', 'available', 'where', 'show',
    'visit', 'travel', 'trip', 'destination', 'location',
    'city', 'country', 'rome', 'mumbai', 'goa', 'pune',
    'mahabaleshwar', 'italy', 'india'
  ];

  const recipeKeywords = [
    'recipe', 'cook', 'ingredient', 'how to make', 'bake',
    'cuisine', 'food', 'biryani', 'manchurian'
  ];

  const allKeywords = [...travelKeywords, ...recipeKeywords];
  return allKeywords.some(keyword => lower.includes(keyword));
}

// --- 2️⃣ Build filters from user query ---
export function buildFilters(userMessage) {
  const filters = {}; // flat object
  const lowerMessage = userMessage.toLowerCase();
  const contentType = detectContentType(userMessage);

  if (contentType === 'tour') {
    // Country extraction
    const countries = ['Italy', 'France', 'India', 'USA', 'Spain'];
    for (let country of countries) {
      if (lowerMessage.includes(country.toLowerCase())) {
        filters.country = country;
        break;
      }
    }

    // City extraction (for tours)
    const cities = ['Rome', 'Mumbai', 'Goa', 'Mahabaleshwar', 'Pune'];
    for (let city of cities) {
      if (lowerMessage.includes(city.toLowerCase())) {
        filters.city = city;
        break;
      }
    }

    // Price extraction
    let priceMatch = lowerMessage.match(/₹\s?([\d,]+)/);
    if (!priceMatch) {
      const underMatch = lowerMessage.match(/under\s+([\d,]+)/i);
      if (underMatch) priceMatch = underMatch;
    }
    if (priceMatch) {
      filters.price = parseInt(priceMatch[1].replace(/,/g, ''));
    }

  } else if (contentType === 'recipe') {
    // Cuisine extraction (for recipes)
    const cuisines = ['indian', 'chinese', 'italian', 'mexican'];
    for (let cuisine of cuisines) {
      if (lowerMessage.includes(cuisine)) {
        filters.cuisine = cuisine;
        break;
      }
    }

    // Dish name extraction with partial matching
    const dishes = ['veg manchurian', 'vegetable biryani', 'paneer butter masala'];
    for (let dish of dishes) {
      const dishWords = dish.toLowerCase().split(' ');
      // If user message includes any word from dish name, consider it a match
      if (dishWords.some(word => lowerMessage.includes(word))) {
        filters.title = dish;
        break;
      }
    }

    // Ingredient extraction (for recipes)
    const ingredients = ['chicken', 'pasta', 'rice', 'cheese', 'tomato', 'onion'];
    for (let ingredient of ingredients) {
      if (lowerMessage.includes(ingredient)) {
        if (!filters.ingredients) filters.ingredients = [];
        filters.ingredients.push(ingredient);
      }
    }
  }

  return filters; // flat object
}


// --- 3️⃣ Fetch from Contentstack and shape results ---
export async function fetchAndShapeResults(userMessage, stackConfig = null) {
  console.log(`[Retrieval] Received user message: "${userMessage}"`);

  if (!needsData(userMessage)) {
    console.log("[Retrieval] No data query detected, returning default greeting.");
    return {
      role: 'assistant',
      name: 'default.greeting',
      content: "Hello! How can I help you today? You can ask about tours, prices, or destinations.",
    };
  }

  const contentType = detectContentType(userMessage);
  const filters = buildFilters(userMessage);

  console.log("[Retrieval] Detected Content Type:", contentType);
  console.log("[Retrieval] Built filters:", filters);

  let entries;
  try {
    entries = await searchEntries(contentType, filters, stackConfig);
    console.log(`[Retrieval] Fetched ${entries?.length || 0} entries from Contentstack.`);
  } catch (err) {
    console.error('❌ Error fetching entries from Contentstack:', err.message);
    return {
      role: 'tool',
      name: 'content.search',
      content: '__TIMEOUT__',
    };
  }

  let filteredEntries = entries || [];

  // Ingredient filtering
  if (contentType === 'recipe' && filters.ingredients?.length > 0) {
    filteredEntries = filteredEntries.filter(entry =>
      filters.ingredients.every(ingredient =>
        (entry.ingredients || '').toLowerCase().includes(ingredient)
      )
    );
  }

  // Price filtering
  if (contentType === 'tour' && filters.price) {
    filteredEntries = filteredEntries.filter(e => {
      if (typeof e.price !== "number") return false;
      return e.price <= filters.price;
    });
  }

  if (!filteredEntries || filteredEntries.length === 0) {
    return {
      role: 'tool',
      name: 'content.search',
      content: 'No results found',
    };
  }

  // Shape entries
  const shapedEntries = filteredEntries.slice(0, TOP_K).map((e, idx) => {
    if (contentType === 'tour') {
      const title = e.title || '';
      const city = e.city || '';
      const country = e.country || '';
      const price = e.price ? `₹${e.price}` : '';
      const highlights = e.highlights || e.multi_line || '';
      const url = typeof e.url === 'string' ? e.url : (e.url?.href || '');
      return `Result ${idx+1}) ${title} — ${city}, ${country} — ${price} — Highlights: ${highlights}. [View: ${url}]`;
    } else if (contentType === 'recipe') {
      const title = e.title || '';
      const cuisine = e.cuisine || '';
      const ingredients = e.ingredients || '';
      const instructions = e.instructions || e.steps || '';
      return `Result ${idx+1}) ${title} — Cuisine: ${cuisine} — Ingredients: ${ingredients} — Instructions: ${instructions}`;
    }
  }).join('\n');

  // Truncate if too long
  const finalContent =
    shapedEntries.length > SUMMARY_CHAR_LIMIT
      ? shapedEntries.slice(0, SUMMARY_CHAR_LIMIT) + '...'
      : shapedEntries;

  return {
    role: 'tool',
    name: 'content.search',
    content: finalContent,
  };
}
