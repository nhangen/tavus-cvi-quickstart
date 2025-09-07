// @ts-check
import { NextResponse } from "next/server";

// Generate a video from text script
/**
 * @param {Request} request
 */
export async function POST(request) {
  const apiKey = process.env.TAVUS_API_KEY;
  const replicaId = process.env.TAVUS_REPLICA_ID;
  const base = process.env.TAVUS_API_BASE ?? "https://tavusapi.com";

  // Log env vars for debugging
  console.log("Video Gen API Key:", apiKey);
  console.log("Video Gen Replica ID:", replicaId);

  if (!apiKey || !replicaId) {
    console.error("Missing environment variables for video generation");
    return NextResponse.json({ error: "Missing required environment variables" }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log("Video generation request body:", body);
    const { script, video_name } = body;

    if (!script) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    const requestBody = {
      replica_id: replicaId,
      script: script,
      ...(video_name && { video_name }),
    };

    console.log("Tavus Video API request body:", requestBody);

    const res = await fetch(`${base}/v2/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Tavus Video API response status:", res.status);

    if (!res.ok) {
      const error = await res.json();
      console.error("Tavus Video API error:", error);
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    console.log("Video generation started:", data);
    
    return NextResponse.json({
      video_id: data.video_id,
      status: data.status,
      video_name: video_name || "Generated Video",
      message: "Video generation started"
    });
  } catch (err) {
    console.error("Failed to generate video:", err);
    return NextResponse.json({ error: "Failed to generate video" }, { status: 500 });
  }
}