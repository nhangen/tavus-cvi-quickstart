"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const start = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/start", { method: "POST" });
      const data = await res.json();
      setUrl(data.conversation_url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Tavus CVI Quickstart</h1>
      <p className="mt-2">Clone → set env → Start Conversation → chat (no camera required).</p>
      <button
        onClick={start}
        disabled={loading}
        className="mt-4 rounded-lg px-4 py-2 border"
      >
        {loading ? "Starting..." : "Start Conversation"}
      </button>

      {url && (
        <div className="mt-6">
          <iframe
            src={url}
            title="Tavus CVI"
            allow="microphone; camera"
            style={{ width: "100%", height: 520, border: "1px solid #ddd", borderRadius: 12 }}
          />
        </div>
      )}
    </main>
  );
}
