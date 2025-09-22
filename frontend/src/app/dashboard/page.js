"use client";

import ConfigForm from "../../components/ConfigForm";
import ChatPreview from "../../components/ChatPreview";
import IntegrationSnippet from "../../components/IntegrationSnippet";

export default function DashboardPage() {
  return (
    <div className="grid gap-8 p-6">
      <h2 className="text-2xl font-bold text-gray-800">Developer Dashboard</h2>
      <ConfigForm />
      <ChatPreview />
      <IntegrationSnippet />
    </div>
  );
}
