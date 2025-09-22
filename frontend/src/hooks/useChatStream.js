"use client";
import { useState } from "react";

export function useChatStream({ apiBaseUrl, provider, modelName }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to get stack config from localStorage
  function getStackConfig() {
    const stackApiKey = localStorage.getItem("cs_stackApiKey");
    const deliveryToken = localStorage.getItem("cs_deliveryToken");
    const environment = localStorage.getItem("cs_environment") || "development";

    if (stackApiKey && deliveryToken) {
      return {
        stackApiKey,
        deliveryToken,
        environment
      };
    }
    return null;
  }

  async function sendMessage(userContent) {
    const newMessages = [...messages, { role: "user", content: userContent }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const stackConfig = getStackConfig();
      
      // If no stack config is found, show a helpful message
      if (!stackConfig) {
        setMessages(prev => [
          ...prev,
          { 
            role: "system", 
            content: "⚠️ Please configure your Contentstack credentials in the settings to enable content-aware responses." 
          }
        ]);
      }

      const requestBody = {
        messages: newMessages,
        modelProvider: provider,
        modelName,
        ...(stackConfig && { stackConfig }) // Only include if available
      };

      const res = await fetch(`${apiBaseUrl}/chat/send`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Also send stack config in headers as backup
          ...(stackConfig && {
            "x-stack-config": JSON.stringify(stackConfig)
          })
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistantMsg = { role: "assistant", content: "" };
      let assistantMsgAdded = false;
      let toolCallProcessed = false;

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

          if (evtName === "tool_call" && !toolCallProcessed) {
            // Add tool results only once
            setMessages((prev) => [
              ...prev,
              { role: "tool", content: data.content },
            ]);
            toolCallProcessed = true;
          }

          if (evtName === "token") {
            // Add assistant message only when we get the first token
            if (!assistantMsgAdded) {
              setMessages((prev) => [...prev, assistantMsg]);
              assistantMsgAdded = true;
            }
            
            assistantMsg.content += data.token;
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[updated.length - 1].role === "assistant") {
                updated[updated.length - 1] = { ...assistantMsg };
              }
              return updated;
            });
          }

          if (evtName === "provider_switch") {
            setMessages((prev) => [
              ...prev,
              {
                role: "system",
                content: `⚡ Switched provider: ${data.from} → ${data.to} (${data.reason})`,
              },
            ]);
          }

          if (evtName === "error") {
            const errorMsg = data.error.includes('Missing Contentstack credentials') 
              ? "❌ Please configure your Contentstack credentials in the settings."
              : `❌ Error: ${data.error}`;
              
            setMessages((prev) => [
              ...prev,
              { role: "system", content: errorMsg },
            ]);
          }

          if (evtName === "done") {
            setLoading(false);
          }
        }
      }
    } catch (err) {
      const errorMsg = err.message.includes('credentials') 
        ? "❌ Please configure your Contentstack credentials in the settings."
        : `❌ Failed: ${err.message}`;
        
      setMessages((prev) => [
        ...prev,
        { role: "system", content: errorMsg },
      ]);
      setLoading(false);
    }
  }

  // Helper to check if stack is configured
  function isStackConfigured() {
    const stackConfig = getStackConfig();
    return !!stackConfig;
  }

  // Helper to clear configuration
  function clearStackConfig() {
    localStorage.removeItem("cs_stackApiKey");
    localStorage.removeItem("cs_deliveryToken");
    localStorage.removeItem("cs_environment");
    localStorage.removeItem("cs_provider");
  }

  return { 
    messages, 
    sendMessage, 
    loading, 
    isStackConfigured,
    clearStackConfig,
    stackConfig: getStackConfig()
  };
}