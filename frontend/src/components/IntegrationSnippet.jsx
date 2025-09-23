"use client";
import { useState, useEffect } from "react";

export default function IntegrationSnippet() {
  const [copied, setCopied] = useState(false);
  const [snippetType, setSnippetType] = useState("basic");
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState({
    provider: "groq",
    stackId: "",
    stackApiKey: "",
    deliveryToken: "",
    environment: "development"
  });

  // Set client flag and load config when component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Load configuration from localStorage (client-side only)
    if (typeof window !== "undefined") {
      setConfig({
        provider: localStorage.getItem("cs_provider") || "groq",
        stackId: localStorage.getItem("cs_stackId") || "",
        stackApiKey: localStorage.getItem("cs_stackApiKey") || "",
        deliveryToken: localStorage.getItem("cs_deliveryToken") || "",
        environment: localStorage.getItem("cs_environment") || "development"
      });
    }
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-backend-url.com";

  // Different snippet variations
  const snippets = {
    basic: `import { ChatWidget } from "doke-chat-sdk";

export default function App() {
  return (
    <div>
      <h1>Your Website Content</h1>
      <div style={{ height: "500px" }}>
        <ChatWidget 
          provider="${config.provider}" 
          stackId="${config.stackId}" 
          apiBaseUrl="${backendUrl}" 
        />
      </div>
    </div>
  );
}`,

    floating: `import { ChatWidget } from "doke-chat-sdk";

export default function App() {
  return (
    <div>
      {/* Your existing website content */}
      <h1>Your Website</h1>
      <p>Your content goes here...</p>
      
      {/* Floating chat widget */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "400px",
        height: "600px",
        zIndex: 1000,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
        <ChatWidget 
          provider="${config.provider}" 
          stackId="${config.stackId}" 
          apiBaseUrl="${backendUrl}" 
        />
      </div>
    </div>
  );
}`,

    withConfig: `import { ChatWidget } from "doke-chat-sdk";

export default function App() {
  return (
    <div style={{ height: "500px" }}>
      <ChatWidget 
        provider="${config.provider}" 
        stackId="${config.stackId}" 
        apiBaseUrl="${backendUrl}"
        config={{
          stackApiKey: "${config.stackApiKey}",
          deliveryToken: "${config.deliveryToken}",
          environment: "${config.environment}",
          theme: {
            primaryColor: "#4F46E5",
            backgroundColor: "#ffffff"
          },
          welcomeMessage: "Hi! How can I help you today?"
        }}
      />
    </div>
  );
}`,

    nextjs: `// pages/index.js or app/page.js
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const ChatWidget = dynamic(
  () => import('doke-chat-sdk').then((mod) => mod.ChatWidget),
  { ssr: false }
);

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Website</h1>
      <div style={{ height: "500px" }}>
        <ChatWidget 
          provider="${config.provider}" 
          stackId="${config.stackId}" 
          apiBaseUrl="${backendUrl}" 
        />
      </div>
    </div>
  );
}`
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippets[snippetType]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = snippets[snippetType];
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Failed to copy snippet. Please copy manually.");
      }
      document.body.removeChild(textArea);
    }
  }

  // Don't render configuration-dependent content until client has mounted
  if (!isClient) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">📋 Integration Snippet</h3>
          <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-10 rounded mb-4"></div>
          <div className="bg-gray-200 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  const isConfigured = config.stackId && config.provider;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">📋 Integration Snippet</h3>
        {!isConfigured && (
          <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
            ⚠️ Configure settings first
          </span>
        )}
      </div>
      
      {/* Snippet type selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Snippet Type:
        </label>
        <select
          value={snippetType}
          onChange={(e) => setSnippetType(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="basic">Basic Integration</option>
          <option value="floating">Floating Chat Widget</option>
          <option value="withConfig">With Full Configuration</option>
          <option value="nextjs">Next.js Integration</option>
        </select>
      </div>

      {/* Code snippet */}
      <div className="relative">
        <pre className="bg-gray-100 text-sm p-4 rounded-lg overflow-x-auto max-h-96">
          <code>{snippets[snippetType]}</code>
        </pre>
        
        {/* Copy button */}
        <button
          onClick={copy}
          className={`absolute top-2 right-2 px-3 py-1 rounded text-sm transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      {/* Installation instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          <strong>Installation:</strong>
        </p>
        <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
          npm install doke-chat-sdk
        </code>
      </div>

      {/* Configuration status */}
      <div className="mt-3 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Provider: <strong>{config.provider}</strong></span>
          {config.stackId && <span>Stack ID: <strong>{config.stackId.slice(0, 8)}...</strong></span>}
          <span>Environment: <strong>{config.environment}</strong></span>
        </div>
      </div>

      {/* Warning if not configured */}
      {!isConfigured && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Please configure your provider and stack ID in the settings 
            before using this snippet. The current values are defaults and may not work properly.
          </p>
        </div>
      )}
    </div>
  );
}