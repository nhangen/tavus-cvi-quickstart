// @ts-check
import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.TAVUS_API_KEY;
  const personaId = process.env.TAVUS_PERSONA_ID;
  const replicaId = process.env.TAVUS_REPLICA_ID;
  const base = process.env.TAVUS_API_BASE ?? "https://tavusapi.com";

  // Log env vars for debugging
  console.log("API Key:", apiKey);
  console.log("Persona ID:", personaId);
  console.log("Replica ID:", replicaId);

  if (!apiKey || !personaId || !replicaId) {
    console.error("Missing environment variables");
    return NextResponse.json({ error: "Missing env vars", conversation_url: null }, { status: 500 });
  }

  let data = null;
  let status = 200;
  try {
  const requestUrl = `${base}/v2/conversations`;
    const requestBody = { persona_id: personaId, replica_id: replicaId };
    console.log("Requesting Tavus API:", requestUrl);
    console.log("Request body:", requestBody);
    const res = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    console.log("Tavus API response status:", res.status);
    status = res.status;
    if (res.headers.get("content-type")?.includes("application/json")) {
      data = await res.json();
    } else {
      data = { error: "Invalid response from Tavus API", conversation_url: null };
    }
    if (!res.ok) {
      console.error("Tavus API error response:", data);
      return NextResponse.json(data, { status });
    }
    return NextResponse.json({ conversation_url: data.conversation_url ?? null });
  } catch (err) {
    console.error("Fetch failed:", err);
    return NextResponse.json({ error: "Fetch failed", conversation_url: null }, { status: 500 });
  }
}
