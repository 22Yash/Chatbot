"use client";
import { useState } from "react";

export default function ConfigForm() {
  const [stackId, setStackId] = useState(localStorage.getItem("cs_stackId") || "");
  const [provider, setProvider] = useState(localStorage.getItem("cs_provider") || "groq");

  function save() {
    localStorage.setItem("cs_stackId", stackId);
    localStorage.setItem("cs_provider", provider);
    alert("Configuration saved!");
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-700">🔑 Connect Your Stack</h3>
      <div className="mt-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter Stack ID"
          value={stackId}
          onChange={(e) => setStackId(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="groq">Groq</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
        <button
          onClick={save}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Save Config
        </button>
      </div>
    </div>
  );
}
