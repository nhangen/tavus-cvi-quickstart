// @ts-check
import { NextResponse } from "next/server";

// Get list of all generated videos
export async function GET() {
  const apiKey = process.env.TAVUS_API_KEY;
  const base = process.env.TAVUS_API_BASE ?? "https://tavusapi.com";

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch(`${base}/v2/videos`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const videos = await res.json();
    return NextResponse.json(videos);
  } catch (err) {
    console.error("Failed to fetch videos:", err);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}