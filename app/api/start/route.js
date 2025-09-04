import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.TAVUS_API_KEY!;
  const personaId = process.env.TAVUS_PERSONA_ID!;
  const replicaId = process.env.TAVUS_REPLICA_ID!;
  const base = process.env.TAVUS_API_BASE ?? "https://api.tavus.io";

  if (!apiKey || !personaId || !replicaId) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const res = await fetch(`${base}/v1/conversations/create-conversation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ persona_id: personaId, replica_id: replicaId }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  return NextResponse.json({ conversation_url: data.conversation_url });
}
