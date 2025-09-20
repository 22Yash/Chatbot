"use client";
import { useState } from "react";

export function useChatStream({ apiBaseUrl, provider, modelName }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(userContent) {
    const newMessages = [...messages, { role: "user", content: userContent }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          modelProvider: provider,
          modelName,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistantMsg = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n").filter(Boolean);

        for (const event of events) {
          const [rawEvent, rawData] = event.split("\n");
          if (!rawEvent || !rawData) continue;

          const evtName = rawEvent.replace("event: ", "").trim();
          const data = JSON.parse(rawData.replace("data: ", ""));

          if (evtName === "token") {
            assistantMsg.content += data.token;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...assistantMsg };
              return updated;
            });
          }

          if (evtName === "tool_call") {
            setMessages((prev) => [
              ...prev,
              { role: "tool", content: data.content },
            ]);
          }

          if (evtName === "provider_switch") {
            setMessages((prev) => [
              ...prev,
              {
                role: "system",
                content: `⚡ Switched provider: ${data.from} → ${data.to}`,
              },
            ]);
          }

          if (evtName === "error") {
            setMessages((prev) => [
              ...prev,
              { role: "system", content: `❌ Error: ${data.error}` },
            ]);
          }

          if (evtName === "done") {
            setLoading(false);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ Failed: ${err.message}` },
      ]);
      setLoading(false);
    }
  }

  return { messages, sendMessage, loading };
}
