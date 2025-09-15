// src/component/ChatWidget.jsx
import React, { useState } from "react";

export function ChatWidget({ client }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Prepare payload
    const payload = {
      messages: [...messages, userMessage],
      modelProvider: "openai", // or "groq"
      modelName: "gpt-4o-mini",
    };

    try {
      const response = await fetch(`${client.url}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value);
          const events = chunk.split("\n\n").filter(Boolean);

          for (const ev of events) {
            const match = ev.match(/^event: (\w+)\ndata: (.+)$/s);
            if (match) {
              const [, event, data] = match;
              const parsed = JSON.parse(data);

              if (event === "token") {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    last.content += parsed.token;
                    return [...prev.slice(0, -1), last];
                  } else {
                    return [...prev, { role: "assistant", content: parsed.token }];
                  }
                });
              }

              if (event === "tool_call") {
                setMessages((prev) => [
                  ...prev,
                  { role: "system", content: parsed.content },
                ]);
              }

              if (event === "done") {
                console.log("✅ Stream finished");
              }

              if (event === "error") {
                console.error("❌ Backend error:", parsed.error);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Streaming error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Connection error. Please try again." },
      ]);
    }
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
