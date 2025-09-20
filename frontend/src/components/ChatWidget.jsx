"use client";
import { useState } from "react";
import { useChatStream } from "../hooks/useChatStream";

export default function ChatWidget({ apiBaseUrl, provider, stackId, modelName = "gpt-4o-mini" }) {
  const { messages, sendMessage, loading } = useChatStream({
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-10">
            👋 Start chatting with your Contentstack bot!
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-indigo-600 text-white ml-auto"
                : msg.role === "assistant"
                ? "bg-gray-200 text-gray-800"
                : "bg-yellow-100 text-yellow-800 text-sm"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm">✍️ Bot is typing...</div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t bg-white p-3 flex gap-2 items-center"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          placeholder="Ask me about tours, prices, or destinations..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
