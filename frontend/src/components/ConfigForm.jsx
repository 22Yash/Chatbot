import React, { useState, useEffect } from "react";
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// Define the App component as a single file with all logic and styling
const App = () => {
  // Global variables provided by the Canvas environment for Firebase
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // State to manage Firebase, user and form data
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null); // Will hold the Firestore-synced config

  useEffect(() => {
    // This effect runs once to initialize Firebase and set up auth listener
    const app = initializeApp(firebaseConfig);
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);

    setAuth(authInstance);
    setDb(dbInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Sign in anonymously if no user is authenticated
        const anonUserCredential = await signInAnonymously(authInstance);
        setUserId(anonUserCredential.user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This effect listens for the auth state and loads the configuration from Firestore
    if (db && userId) {
      const configDocRef = doc(db, `/artifacts/${appId}/users/${userId}/configs/contentstack`);
      
      const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          // If the document doesn't exist, use default values
          setConfig({
            stackApiKey: "",
            deliveryToken: "",
            environment: "development",
            provider: "groq",
          });
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching config:", error);
        setConfig({
          stackApiKey: "",
          deliveryToken: "",
          environment: "development",
          provider: "groq",
        });
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [db, userId, appId]);

  const saveConfigToFirestore = async (newConfig) => {
    if (!db || !userId) {
      console.error("Firestore or User ID not available.");
      return;
    }

    try {
      const configDocRef = doc(db, `/artifacts/${appId}/users/${userId}/configs/contentstack`);
      await setDoc(configDocRef, newConfig, { merge: true });
      return { success: true, message: "Configuration saved to database." };
    } catch (error) {
      console.error("Error saving config to Firestore:", error);
      return { success: false, message: `Failed to save configuration: ${error.message}` };
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center text-gray-500">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-lg">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="max-w-md w-full">
        <ConfigForm
          initialConfig={config}
          onConfigSave={saveConfigToFirestore}
          userId={userId}
        />
        <div className="mt-4 text-center text-gray-500 text-sm">
          User ID: <span className="font-mono break-all">{userId}</span>
        </div>
      </div>
    </div>
  );
};

const ConfigForm = ({ initialConfig, onConfigSave, userId }) => {
  const [config, setConfig] = useState(initialConfig);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    // Update local state when initialConfig prop changes
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

    // Simulate an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demonstration, all credentials are "valid"
    const validationSuccess = true;

    if (validationSuccess) {
      const result = await onConfigSave(config);
      if (result.success) {
        setValidationResult({ success: true, message: "Configuration saved and validated!" });
      } else {
        setValidationResult({ success: false, message: result.message });
      }
    } else {
      setValidationResult({ 
        success: false, 
        message: "Failed to validate credentials (simulated error)." 
      });
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
