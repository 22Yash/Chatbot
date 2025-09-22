"use client";
import { useState } from "react";
import { useChatStream } from "../hooks/useChatStream";

// --- Enhanced parser for tool responses ---
function parseToolContent(content) {
  if (!content || typeof content !== "string") return null;

  // --- Recipes ---
  if (content.toLowerCase().includes("recipe") && content.toLowerCase().includes("cuisine:")) {
    return content
      .split(/Recipe\s+\d+\)/i)
      .filter(Boolean)
      .map((chunk) => {
        const titleMatch = chunk.match(/^\s*(.*?)\s+—/);
        const cuisineMatch = chunk.match(/Cuisine:\s*(.*?)\s+—/);
        const descMatch = chunk.match(/Description:\s*(.*?)\s+—/);
        const ingMatch = chunk.match(/Ingredients:\s*(.*?)\s+—/);
        const stepsMatch = chunk.match(/Steps:\s*(.*)/);

        // Only return if we have valid content
        const title = titleMatch?.[1]?.trim();
        const ingredients = ingMatch?.[1]?.trim();
        const steps = stepsMatch?.[1]?.trim();
        
        if (!title || !ingredients || !steps) return null;

        return {
          type: "recipe",
          title,
          cuisine: cuisineMatch?.[1]?.trim() || "General",
          description: descMatch?.[1]?.trim() || "",
          ingredients,
          steps,
        };
      })
      .filter(Boolean); // Remove null entries
  }

  // --- Tours ---
  if (content.toLowerCase().includes("result") && (content.includes("₹") || content.includes("—"))) {
    return content
      .split(/Result\s+\d+\)/i)
      .filter(Boolean)
      .map((chunk) => {
        const titleMatch = chunk.match(/^\s*(.*?)\s+—/);
        const locationMatch = chunk.match(/—\s*(.*?),\s*(.*?)\s+—/);
        const priceMatch = chunk.match(/—\s*(₹[\d,]+|Price on request)/);
        const highlightsMatch = chunk.match(/Highlights:\s*(.*?)\.\s*\[/);
        const urlMatch = chunk.match(/\[View:\s*(.*?)\]/);

        const title = titleMatch?.[1]?.trim();
        if (!title) return null;

        return {
          type: "tour",
          title,
          city: locationMatch?.[1]?.trim() || "",
          country: locationMatch?.[2]?.trim() || "",
          price: priceMatch?.[1]?.trim() || "Price on request",
          highlights: highlightsMatch?.[1]?.trim() || "",
          url: urlMatch?.[1]?.trim() !== "" ? urlMatch?.[1]?.trim() : null,
        };
      })
      .filter(Boolean);
  }

  return null;
}

export default function ChatWidget({
  apiBaseUrl,
  provider,
  stackId,
  modelName = "gpt-4o-mini",
}) {
  const { messages, sendMessage, loading, isStackConfigured, isClient } = useChatStream({
    apiBaseUrl,
    provider,
    modelName,
  });

  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }

  // Show loading state while waiting for client-side hydration
  if (!isClient) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="text-center mt-10">
            <div className="animate-pulse space-y-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="border-t bg-white p-4 flex gap-3 items-end">
          <div className="flex-1">
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-40 mt-1 animate-pulse"></div>
          </div>
          <div className="w-16 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Configuration Warning - Only show after client mounts */}
      {isClient && !isStackConfigured() && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <span className="text-amber-600">⚠️</span>
            Configure your Contentstack credentials in settings for content-aware responses
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center mt-10">
            <div className="text-gray-400 text-lg mb-2">👋</div>
            <p className="text-gray-500">
              Start chatting with your Contentstack bot!
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Try: "Rome tour", "Mumbai tour", "paneer recipe", "italian recipe"
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          // 🟡 Tool results (structured cards)
          if (msg.role === "tool") {
            const parsed = parseToolContent(msg.content);
            if (parsed && parsed.length > 0) {
              return (
                <div key={idx} className="space-y-4">
                  <div className="text-sm text-gray-500 font-medium">
                    📋 Found {parsed.length} result{parsed.length > 1 ? 's' : ''} from Contentstack:
                  </div>
                  <div className="grid gap-4">
                    {parsed.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {item.type === "recipe" && (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-bold text-lg text-gray-800">
                                {item.title}
                              </h3>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                🍴 {item.cuisine}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            
                            <div className="space-y-3 text-sm">
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="font-medium text-orange-800 mb-1">🛒 Ingredients:</div>
                                <p className="text-orange-700">{item.ingredients}</p>
                              </div>
                              
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="font-medium text-blue-800 mb-1">👩‍🍳 Steps:</div>
                                <p className="text-blue-700 leading-relaxed">{item.steps}</p>
                              </div>
                            </div>
                          </>
                        )}

                        {item.type === "tour" && (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-bold text-lg text-gray-800">
                                {item.title}
                              </h3>
                              {item.price && (
                                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                  💰 {item.price}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <span className="text-sm">📍</span>
                              <span className="text-sm font-medium">
                                {item.city}, {item.country}
                              </span>
                            </div>
                            
                            {item.highlights && (
                              <div className="bg-purple-50 p-3 rounded-lg mb-3">
                                <div className="font-medium text-purple-800 mb-1">✨ Highlights:</div>
                                <p className="text-purple-700 text-sm">{item.highlights}</p>
                              </div>
                            )}
                            
                            {item.url && item.url !== "" && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                🔗 View Details
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else {
              // Fallback for unparsed tool content
              return (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-blue-800 text-sm font-medium mb-1">📋 Content Results:</div>
                  <div className="text-blue-700 text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              );
            }
          }

          // 🔵 Default message bubbles (user, assistant, system)
          return (
            <div
              key={idx}
              className={`rounded-xl max-w-[85%] ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white ml-auto px-4 py-3"
                  : msg.role === "assistant"
                  ? "bg-white text-gray-800 px-4 py-3 shadow-sm border border-gray-200"
                  : "bg-yellow-100 text-yellow-800 px-3 py-2 text-sm border border-yellow-200"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 text-sm mt-0.5">🤖</span>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              )}
              
              {msg.role === "user" && msg.content}
              
              {msg.role === "system" && (
                <div className="flex items-center gap-2">
                  <span>ℹ️</span>
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
        
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full"></div>
            Bot is thinking...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-t bg-white p-4 flex gap-3 items-end"
      >
        <div className="flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Ask about tours, recipes, or anything else..."
            disabled={loading}
          />
          <div className="text-xs text-gray-400 mt-1">
            Try: "Rome tour", "Mumbai tour", "paneer recipe", "chinese food"
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}