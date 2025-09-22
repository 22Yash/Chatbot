import React, { useState, useEffect } from "react";

// Define the App component as a single file with all logic and styling
const App = () => {
  // State to manage the form configuration
  const [config, setConfig] = useState({
    stackApiKey: "",
    deliveryToken: "",
    environment: "development",
    provider: "groq",
  });
  
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="max-w-md w-full">
        <ConfigForm
          initialConfig={config}
          onConfigSave={saveConfigToLocalStorage}
          validationResult={validationResult}
          setValidationResult={setValidationResult}
        />
      </div>
    </div>
  );
};

const ConfigForm = ({ initialConfig, onConfigSave, validationResult, setValidationResult }) => {
  const [config, setConfig] = useState(initialConfig);
  const [isValidating, setIsValidating] = useState(false);
  const apiBaseUrl = "http://localhost:3000";

  // Update local state when initialConfig prop changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

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

    // This section is commented out to avoid build errors. 
    // The fetch call below is for your local environment and can be uncommented
    // if you have the local server running and want to validate credentials.
    
    // try {
    //   const testResponse = await fetch(`${apiBaseUrl}/chat/validate-stack`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       stackApiKey: config.stackApiKey,
    //       deliveryToken: config.deliveryToken,
    //       environment: config.environment,
    //     }),
    //   });

    //   if (!testResponse.ok) {
    //     const errorResult = await testResponse.json();
    //     setValidationResult({ success: false, message: errorResult.error || `Server responded with status: ${testResponse.status}` });
    //     setIsValidating(false);
    //     return;
    //   }

    //   const result = await testResponse.json();
      
    //   if (result.success) {
    //     const saveResult = onConfigSave(config);
    //     if (saveResult.success) {
    //       setValidationResult({ success: true, message: "Configuration saved and validated!" });
    //     } else {
    //       setValidationResult({ success: false, message: saveResult.message });
    //     }
    //   } else {
    //     setValidationResult({ success: false, message: result.error || "Failed to validate credentials" });
    //   }
    // } catch (error) {
    //   setValidationResult({ success: false, message: "Network error: " + error.message });
    // } finally {
    //   setIsValidating(false);
    // }

    // Simulate validation and saving to demonstrate functionality without a live server
    await new Promise(resolve => setTimeout(resolve, 1500));
    const saveResult = onConfigSave(config);
    if (saveResult.success) {
      setValidationResult({ success: true, message: "Configuration saved and validated (simulated)!" });
    } else {
      setValidationResult({ success: false, message: saveResult.message });
    }
    setIsValidating(false);
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

export default App;
