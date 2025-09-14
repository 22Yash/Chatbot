    // src/config/contentstack.js
import Contentstack from "contentstack";
import { env } from "./env.js";

export const stack = Contentstack.Stack({
  api_key: env.CONTENTSTACK_STACK_API_KEY,
  delivery_token: env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: env.CONTENTSTACK_ENVIRONMENT,
});
