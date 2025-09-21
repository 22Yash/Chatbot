import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const CONTENTSTACK_API_URL = "https://eu-cdn.contentstack.com/v3";

// Fallback to environment variables for backward compatibility
const DEFAULT_STACK_API_KEY = process.env.CONTENTSTACK_STACK_API_KEY;
const DEFAULT_ACCESS_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const DEFAULT_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT;

/**
 * Search entries by type and filters with dynamic credentials
 * @param {string} type - Content type (e.g., 'tour')
 * @param {object} filters - Query filters
 * @param {object} stackConfig - Dynamic stack configuration
 * @param {string} stackConfig.stackApiKey - Stack API Key
 * @param {string} stackConfig.deliveryToken - Delivery Token
 * @param {string} stackConfig.environment - Environment name
 */
export async function searchEntries(type, filters = {}, stackConfig = null) {
  try {
    // Use provided config or fallback to environment variables
    const config = stackConfig || {
      stackApiKey: DEFAULT_STACK_API_KEY,
      deliveryToken: DEFAULT_ACCESS_TOKEN,
      environment: DEFAULT_ENVIRONMENT,
    };

    if (!config.stackApiKey || !config.deliveryToken) {
      throw new Error("Missing Contentstack credentials. Please configure your stack.");
    }

    const response = await axios.get(
      `${CONTENTSTACK_API_URL}/content_types/${type}/entries`,
      {
        headers: {
          api_key: config.stackApiKey,
          access_token: config.deliveryToken,
        },
        params: {
          environment: config.environment,
          // Corrected: Pass the filters object directly. Axios will handle the
          // URL encoding to "query={...}" correctly.
          query: filters,
          // Added 'highlights' to the 'only' parameter
          only: "title,city,country,price,url,availability,highlights",
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
 * Validate stack credentials by making a test API call
 * @param {object} stackConfig - Stack configuration to validate
 */
export async function validateStackCredentials(stackConfig) {
  try {
    const response = await axios.get(
      `${CONTENTSTACK_API_URL}/content_types`,
      {
        headers: {
          api_key: stackConfig.stackApiKey,
          access_token: stackConfig.deliveryToken,
        },
        params: {
          environment: stackConfig.environment,
        },
      }
    );
    
    return {
      success: true,
      contentTypes: response.data.content_types?.length || 0,
      message: `Successfully connected! Found ${response.data.content_types?.length || 0} content types.`
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error_message || 
                         error.response?.statusText || 
                         error.message;
    
    return {
      success: false,
      error: errorMessage,
      message: `Failed to connect: ${errorMessage}`
    };
  }
}

/**
 * Get a single entry by ID with dynamic credentials
 */
export async function getEntryById(type, entryId, stackConfig = null) {
  try {
    const config = stackConfig || {
      stackApiKey: DEFAULT_STACK_API_KEY,
      deliveryToken: DEFAULT_ACCESS_TOKEN,
      environment: DEFAULT_ENVIRONMENT,
    };

    const response = await axios.get(
      `${CONTENTSTACK_API_URL}/content_types/${type}/entries/${entryId}`,
      {
        headers: {
          api_key: config.stackApiKey,
          access_token: config.deliveryToken,
        },
        params: {
          environment: config.environment,
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
