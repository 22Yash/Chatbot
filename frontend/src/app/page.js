"use client"

export default function Home() {
  return (
    <div className="text-center mt-20">
      <h2 className="text-4xl font-extrabold text-gray-900">
        Plug-and-Play Chat Agents for <span className="text-indigo-600">Contentstack</span>
      </h2>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Build domain-specific chat agents powered by Groq, OpenAI, or Anthropic in minutes. 
        Connect your stack, preview, and copy the embed snippet.
      </p>
      <a
        href="/dashboard"
        className="mt-8 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700"
      >
        Go to Dashboard →
      </a>
    </div>
  );
}
