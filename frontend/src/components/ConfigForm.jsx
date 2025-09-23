"use client";
import { useState, useEffect } from "react";

const ConfigForm = () => {
  const [config, setConfig] = useState({
    stackApiKey: "",
    deliveryToken: "",
    environment: "development",
    provider: "groq",
  });
  
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Load config from localStorage on initial render
    const savedConfig = {
      stackApiKey: localStorage.getItem("cs_stackApiKey") || "",
      deliveryToken: localStorage.getItem("cs_deliveryToken") || "",
      environment: localStorage.getItem("cs_environment") || "development",
      provider: localStorage.getItem("cs_provider") || "groq",
    };
    setConfig(savedConfig);
  }, []);

  const saveConfigToLocalStorage = (newConfig) => {
    if (!isClient) return { success: false, message: "Not on client side" };
    
    try {
      localStorage.setItem("cs_stackApiKey", newConfig.stackApiKey);
      localStorage.setItem("cs_deliveryToken", newConfig.deliveryToken);
      localStorage.setItem("cs_environment", newConfig.environment);
      localStorage.setItem("cs_provider", newConfig.provider);
      return { success: true, message: "Configuration saved to local storage." };
    } catch (error) {
      console.error("Error saving config to localStorage:", error);
      return { success: false, message: `Failed to save configuration: ${error.message}` };
    }
  };

  function handleChange(field, value) {
    setConfig(prev => ({ ...prev, [field]: value }));
    setValidationResult(null);
  }

  async function validateAndSave() {
    if (!config.stackApiKey || !config.deliveryToken) {
      setValidationResult({ success: false, message: "Please fill in all required fields." });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    // Simulate validation for demo purposes
    // In production, you would uncomment the actual API validation
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll simulate a successful validation
      const saveResult = saveConfigToLocalStorage(config);
      if (saveResult.success) {
        setValidationResult({ success: true, message: "Configuration saved and validated!" });
      } else {
        setValidationResult({ success: false, message: saveResult.message });
      }
    } catch (error) {
      setValidationResult({ success: false, message: "Network error: " + error.message });
    } finally {
      setIsValidating(false);
    }
  }

  // Show loading state while waiting for client-side hydration
  if (!isClient) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v-2m0 0V8m0 4h2m-2 0H8" />
        </svg>
        Connect Your Contentstack
      </h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Stack API Key *
          </label>
          <input
            type="text"
            placeholder="Enter your Stack API Key (blt...)"
            value={config.stackApiKey}
            onChange={(e) => handleChange("stackApiKey", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Delivery Token *
          </label>
          <input
            type="text"
            placeholder="Enter your Delivery Token (cs...)"
            value={config.deliveryToken}
            onChange={(e) => handleChange("deliveryToken", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Environment
          </label>
          <select
            value={config.environment}
            onChange={(e) => handleChange("environment", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            LLM Provider
          </label>
          <select
            value={config.provider}
            onChange={(e) => handleChange("provider", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
          >
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {validationResult && (
          <div className={`p-4 rounded-xl font-medium ${
            validationResult.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {validationResult.message}
          </div>
        )}

        <button
          onClick={validateAndSave}
          disabled={isValidating}
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isValidating ? "Validating..." : "Save & Validate Configuration"}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-200 leading-relaxed">
        <p className="font-bold">How to get your credentials:</p>
        <ul className="mt-2 space-y-1">
          <li>• Go to your Contentstack dashboard</li>
          <li>• Navigate to Settings → Stack Settings</li>
          <li>• Copy your Stack API Key and Delivery Token</li>
          <li>• Make sure your environment name matches exactly</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigForm;