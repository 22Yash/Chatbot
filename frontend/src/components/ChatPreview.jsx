"use client";
import ChatWidget from "./ChatWidget";

export default function ChatPreview() {
  const stackId = typeof window !== "undefined" ? localStorage.getItem("cs_stackId") : "";
  const provider = typeof window !== "undefined" ? localStorage.getItem("cs_provider") : "groq";

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-700">💬 Chat Preview</h3>
      <div className="mt-4 h-[500px] border rounded-lg overflow-hidden">
        <ChatWidget
          provider={provider}
          stackId={stackId}
          apiBaseUrl={process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}
        />
      </div>
    </div>
  );
}
