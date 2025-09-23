# 🚀 Doke Chatbot SDK – Contentstack Powered Conversational AI

![TechSurf 2025](https://img.shields.io/badge/TechSurf%202025-Problem%201-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/Built%20with-React%20%7C%20Node.js%20%7C%20Contentstack-orange?style=for-the-badge)

## 📌 Problem Statement 1: Build a Chat Agent Platform for Developers

> **Challenge:** Build a plug-and-play platform that helps developers create custom chat agents in just a few steps. These agents should be powered by LLMs (like Groq) and work with content stored in Contentstack.

## 🎯 My Solution

I built a **complete Chat Agent Platform** that solves the exact requirements:

### ✅ **LLM Model API** - Backend Service
- **Streaming Chat API** (`/chat/send`) with real-time token streaming via SSE
- **Multi-Provider Support** - OpenAI, Groq , Gemini  with automatic fallback
- **Contentstack Integration** - Connects to Delivery APIs using MCP to fetch content dynamically
- **Domain-Specific Querying** - Handles travel tours, recipes, and any Contentstack content type

### ✅ **Chat SDK** - Frontend Package
- **Lightweight React SDK** published as `doke-chat-sdk` on npm
- **React Hooks Integration** (`useChatStream`) for seamless state management
- **Plug-and-Play Widget** - Embed in any React/Next.js app with 3 lines of code
- **Zero Backend Knowledge Required** - Developers just install and configure

---

## 🌟 Key Features Addressing Requirements

| **Requirement** | **Our Implementation** |
|----------------|------------------------|
| **LLM Streaming** | ✅ Real-time SSE token streaming with multiple providers |
| **Contentstack MCP** | ✅ Dynamic content fetching via Delivery APIs |
| **Developer-Friendly** | ✅ `npm install doke-chat-sdk` → Ready to use |
| **Domain-Specific** | ✅ Travel: *"Tours for Italy under €500"*, Recipe: *"Veg pasta recipes"* |
| **React Hooks** | ✅ `useChatStream` hook for complete chat management |

---

## 🛠️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Chat SDK      │    │   Backend API   │
│   (Next.js)     │◄──►│ (doke-chat-sdk) │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   LLM Providers │
                                              │ OpenAI│Groq│etc │
                                              └─────────────────┘
```

---

## 🚀 Quick Start for Developers

### 1. Install the SDK
```bash
npm install doke-chat-sdk
```

### 2. Use in React App
```jsx
import { ChatWidget } from "doke-chat-sdk";

export default function App() {
  return (
    <div className="h-screen">
      <ChatWidget 
        apiBaseUrl="https://chatbot-0ij7.onrender.com"
        provider="groq"
      />
    </div>
  );
}
```

### 3. Configure Contentstack
Users add their stack credentials in the chat settings:
- **Stack API Key**
- **Delivery Token** 
- **Environment**

**That's it!** The chatbot now answers questions from their Contentstack content.

---

## 💡 Real-World Examples

### Travel Domain
**Query:** *"What tours are available for Italy?"*

**Response:** The AI fetches from `Tour` content type, filters by destination, and presents:
- *"Rome Historical Tour - €299"*
- *"Venice Canal Experience - €450"*
- *"Tuscany Wine Tour - €380"*

### Recipe Domain
**Query:** *"Veg pasta recipe"*

**Response:** Fetches from `Recipe` content type and returns:
- *"Veggie Pasta Primavera with ingredients and step-by-step instructions..."*

---

## 🏗️ Technical Implementation

### Backend (LLM Model API)
- **Node.js + Express** server
- **Server-Sent Events (SSE)** for streaming responses
- **Contentstack Delivery API** integration via MCP
- **Provider fallback logic** (OpenAI → Groq → Anthropic)
- **Content-aware querying** with semantic search

### Frontend SDK
- **React components** with TypeScript
- **useChatStream hook** for state management  
- **TailwindCSS** for styling
- **Rollup bundling** for npm distribution
- **Zero external dependencies** (except React)

### Contentstack Integration
- **Dynamic stack configuration** - users connect their own stacks
- **Content type detection** - automatically handles Tours, Recipes, etc.
- **Real-time content fetching** via Delivery API
- **MCP-compliant** content delivery integration

---

## 🎯 Problem Statement Compliance

| **PS1 Requirement** | **✅ Implementation** |
|--------------------|----------------------|
| LLM API with streaming | Real-time SSE streaming with token-by-token delivery |
| Multiple LLM providers | OpenAI, Groq, Anthropic with automatic fallback |
| Contentstack MCP integration | Dynamic content fetching via Delivery APIs |
| Lightweight Chat SDK | Published `doke-chat-sdk` package on npm |
| React Hooks support | `useChatStream` hook for complete chat management |
| Easy embedding | 3-line integration in any React app |
| Domain-specific agents | Travel tours, recipes, and extensible content types |
| Minimal setup | Zero backend knowledge required for developers |

---

## 🚀 Live Demo & Deployment

### 🌐 **Live Demo:** [https://chatbot-rho-liart-17.vercel.app](https://chatbot-rho-liart-17.vercel.app)
### 📦 **NPM Package:** [https://www.npmjs.com/package/doke-chat-sdk](https://www.npmjs.com/package/doke-chat-sdk)
### 🔗 **Backend API:** [https://chatbot-0ij7.onrender.com](https://chatbot-0ij7.onrender.com)

---

## 🔧 Local Development

### Backend Setup
```bash
git clone https://github.com/22Yash/Chatbot.git
cd Chatbot/backend
npm install
npm run server  # Runs on http://localhost:3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:3001
```

### SDK Development
```bash
cd sdk
npm install
npm run build   # Builds the SDK package
```

---

## 🎥 Video Demo Flow

1. **Problem Introduction** - Show complexity of building chat agents
2. **Our Solution Demo** - Live chat with travel/recipe queries  
3. **Developer Experience** - `npm install` → working chatbot in 30 seconds
4. **Contentstack Integration** - Show dynamic stack configuration
5. **SDK Usage** - Multiple integration patterns (floating, inline)

---

## 📊 Testing Queries

Try these in the live demo:

**Travel Queries:**
- *"Mumbai tour "*
- *"Beach destinations in Goa"*
- *"Italy tour"*

**Recipe Queries:**
- *"Quick veg dinner recipe"*
- *"Paneer butter masala ingredients"*
- *"Veg Manchurain "*

---

## 🏆 Why This Wins TechSurf

✅ **Complete Problem Solution** - Addresses every requirement in PS1  
✅ **Production Ready** - Live demo, deployed backend, published SDK  
✅ **Developer Experience** - Actually easy to use (`npm install` → done)  
✅ **Contentstack Native** - Built specifically for Contentstack workflows  
✅ **Extensible** - Works with any content type, not just travel/recipes  
✅ **Modern Tech Stack** - React, Node.js, streaming APIs, hooks  

---

## 🤝 Team & Acknowledgments

**Built by:** [Yash Doke](https://github.com/22Yash)  
**For:** TechSurf 2025 Hackathon - Problem Statement 1  
**Powered by:** Contentstack, Groq, OpenAI, Vercel, Render

---

## 📄 License

MIT © 2025 - Feel free to use this SDK in your projects!

---

**Ready to revolutionize how developers build chat agents with Contentstack!** 🎯
