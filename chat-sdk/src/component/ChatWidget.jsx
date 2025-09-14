import React, { useState, useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

export function ChatWidget({ client }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const eventSourceRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Prepare payload
    const payload = {
      messages: [...messages, userMessage],
      modelProvider: "openai", // or your provider
      modelName: "gpt-4o-mini",
    };

    // Open SSE connection
    eventSourceRef.current = new EventSourcePolyfill(`${client.url}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.token) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            // append token to bot message
            if (last?.role === "assistant") {
              last.content += data.token;
              return [...prev.slice(0, -1), last];
            } else {
              return [...prev, { role: "assistant", content: data.token }];
            }
          });
        }
      } catch (err) {
        console.error("SSE parsing error:", err);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error("SSE error:", err);
      eventSourceRef.current.close();
    };

    eventSourceRef.current.addEventListener("done", () => {
      eventSourceRef.current.close();
    });
  };

  return (
    <div className="chat-widget">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
