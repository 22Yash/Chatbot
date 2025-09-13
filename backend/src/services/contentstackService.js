import axios from "axios";

const CONTENTSTACK_API_URL = "https://cdn.contentstack.io/v3";
const STACK_API_KEY = process.env.CONTENTSTACK_STACK_API_KEY;
const ACCESS_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;

/**
 * Search entries by type and filters
 */
export async function searchEntries(type, filters = {}) {
  try {
    const response = await axios.get(
      `${CONTENTSTACK_API_URL}/content_types/${type}/entries`,
      {
        headers: {
          api_key: STACK_API_KEY,
          access_token: ACCESS_TOKEN,   // ✅ correct
        },
        params: {
          query: JSON.stringify(filters),
          only: "title,city,country,price,url,availability",
        },
      }
    );
    return response.data.entries;
  } catch (error) {
    console.error(
      "Error fetching entries:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Get a single entry by ID
 */
export async function getEntryById(type, entryId) {
  try {
    const response = await axios.get(
      `${CONTENTSTACK_API_URL}/content_types/${type}/entries/${entryId}`,
      {
        headers: {
          api_key: STACK_API_KEY,
          access_token: ACCESS_TOKEN,   // ✅ correct
        },
      }
    );
    return response.data.entry;
  } catch (error) {
    console.error(
      "Error fetching entry by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
}
