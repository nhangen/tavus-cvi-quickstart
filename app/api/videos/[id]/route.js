// @ts-check
import { NextResponse } from "next/server";

// Get video status and details
/**
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 */
export async function GET(request, { params }) {
  const apiKey = process.env.TAVUS_API_KEY;
  const base = process.env.TAVUS_API_BASE ?? "https://tavusapi.com";
  const { id } = params;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch(`${base}/v2/videos/${id}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const video = await res.json();
    return NextResponse.json(video);
  } catch (err) {
    console.error("Failed to fetch video:", err);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}