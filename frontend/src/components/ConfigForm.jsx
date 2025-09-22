"use client";
import { useState } from "react";

export default function ConfigForm({ onConfigSave }) {
  // ✅ Safe lazy initializer for localStorage
  const [config, setConfig] = useState(() => {
    if (typeof window !== "undefined") {
      return {
        stackApiKey: localStorage.getItem("cs_stackApiKey") || "",
        deliveryToken: localStorage.getItem("cs_deliveryToken") || "",
        environment: localStorage.getItem("cs_environment") || "development",
        provider: localStorage.getItem("cs_provider") || "groq",
      };
    }
    return {
      stackApiKey: "",
      deliveryToken: "",
      environment: "development",
      provider: "groq",
    };
  });

  const apiBaseUrl = "http://localhost:3000";

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  function handleChange(field, value) {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setValidationResult(null);
  }

  async function validateAndSave() {
    if (!apiBaseUrl) {
      setValidationResult({
        success: false,
        message:
          "API Base URL is not configured. Please check the parent component.",
      });
      console.error(
        "apiBaseUrl is undefined. The parent component must pass a valid URL to the ConfigForm component."
      );
      return;
    }

    if (!config.stackApiKey || !config.deliveryToken) {
      setValidationResult({
        success: false,
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const testResponse = await fetch(`${apiBaseUrl}/chat/validate-stack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stackApiKey: config.stackApiKey,
          deliveryToken: config.deliveryToken,
          environment: config.environment,
        }),
      });

      if (!testResponse.ok) {
        try {
          const errorResult = await testResponse.json();
          setValidationResult({
            success: false,
            message:
              errorResult.error ||
              `Server responded with status: ${testResponse.status}`,
          });
        } catch {
          setValidationResult({
            success: false,
            message:
              "Network error: Server did not return a valid JSON response. Check the URL and server logs.",
          });
        }
        return;
      }

      const result = await testResponse.json();

      if (result.success) {
        // ✅ Safe localStorage usage (only runs client-side)
        localStorage.setItem("cs_stackApiKey", config.stackApiKey);
        localStorage.setItem("cs_deliveryToken", config.deliveryToken);
        localStorage.setItem("cs_environment", config.environment);
        localStorage.setItem("cs_provider", config.provider);

        setValidationResult({
          success: true,
          message: "Configuration saved and validated!",
        });

        if (onConfigSave) {
          onConfigSave(config);
        }
      } else {
        setValidationResult({
          success: false,
          message: result.error || "Failed to validate credentials",
        });
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: "Network error: " + error.message,
      });
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        🔑 Connect Your Contentstack
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stack API Key *
          </label>
          <input
            type="text"
            placeholder="Enter your Stack API Key (blt...)"
            value={config.stackApiKey}
            onChange={(e) => handleChange("stackApiKey", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Token *
          </label>
          <input
            type="text"
            placeholder="Enter your Delivery Token (cs...)"
            value={config.deliveryToken}
            onChange={(e) => handleChange("deliveryToken", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Environment
          </label>
          <select
            value={config.environment}
            onChange={(e) => handleChange("environment", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LLM Provider
          </label>
          <select
            value={config.provider}
            onChange={(e) => handleChange("provider", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {validationResult && (
          <div
            className={`p-3 rounded-lg ${
              validationResult.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {validationResult.message}
          </div>
        )}

        <button
          onClick={validateAndSave}
          disabled={isValidating}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-wait"
        >
          {isValidating ? "Validating..." : "Save & Validate Configuration"}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-600">
        <p>
          <strong>How to get your credentials:</strong>
        </p>
        <ul className="mt-1 space-y-1">
          <li>• Go to your Contentstack dashboard</li>
          <li>• Navigate to Settings → Stack Settings</li>
          <li>• Copy your Stack API Key and Delivery Token</li>
          <li>• Make sure your environment name matches exactly</li>
        </ul>
      </div>
    </div>
  );
}
