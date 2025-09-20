"use client";

export default function IntegrationSnippet() {
  const provider =
    typeof window !== "undefined"
      ? localStorage.getItem("cs_provider") || "groq"
      : "groq";
  const stackId =
    typeof window !== "undefined"
      ? localStorage.getItem("cs_stackId") || ""
      : "";

  const snippet = `import { ChatWidget } from "chat-sdk";

export default function App() {
  return <ChatWidget provider="${provider}" stackId="${stackId}" apiBaseUrl="${process.env.NEXT_PUBLIC_BACKEND_URL}" />;
}`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    alert("Snippet copied to clipboard!");
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-700">📋 Integration Snippet</h3>
      <pre className="bg-gray-100 text-sm p-4 rounded-lg overflow-x-auto mt-3">{snippet}</pre>
      <button
        onClick={copy}
        className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        Copy Snippet
      </button>
    </div>
  );
}
