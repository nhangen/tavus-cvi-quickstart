// @ts-check
import { NextResponse } from "next/server";

// Get a specific conversation by ID
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
    const res = await fetch(`${base}/v2/conversations/${id}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const conversation = await res.json();
    return NextResponse.json(conversation);
  } catch (err) {
    console.error("Failed to fetch conversation:", err);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}