import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1";

// Helper to safely parse JSON response
async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Failed to parse response:", text.substring(0, 200));
    return { error: "Invalid response from server", rawResponse: text.substring(0, 100) };
  }
}

// GET stream info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  const { streamId } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    let url = `${API_BASE}/stream/${streamId}`;
    if (action === "info") url = `${API_BASE}/stream/${streamId}/info`;
    if (action === "listeners") url = `${API_BASE}/stream/${streamId}/listeners`;

    console.log(`[Stream API] GET ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    
    const data = await safeJsonParse(response);
    
    // If listeners action and we got an error, return default
    if (action === "listeners" && (data.error || !response.ok)) {
      return NextResponse.json({ listeners: 0, liveStreamId: streamId }, { status: 200 });
    }
    
    // If info action and we got an error, return default active status
    if (action === "info" && (data.error || !response.ok)) {
      return NextResponse.json({ status: "ACTIVE", listenerCount: 0 }, { status: 200 });
    }
    
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error("[Stream API] GET error:", error);
    // Return safe defaults instead of error
    if (action === "listeners") {
      return NextResponse.json({ listeners: 0, liveStreamId: streamId }, { status: 200 });
    }
    if (action === "info") {
      return NextResponse.json({ status: "ACTIVE", listenerCount: 0 }, { status: 200 });
    }
    return NextResponse.json({ error: "Failed to fetch stream info" }, { status: 500 });
  }
}

// POST actions (end, join, leave, record)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  const { streamId } = await params;
  const token = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");

  try {
    let url = `${API_BASE}/stream/${streamId}`;
    if (action === "end") url = `${API_BASE}/stream/${streamId}/end`;
    if (action === "join") url = `${API_BASE}/stream/${streamId}/join?userId=${userId}`;
    if (action === "leave") url = `${API_BASE}/stream/${streamId}/leave?userId=${userId}`;
    if (action === "record-start") url = `${API_BASE}/stream/${streamId}/record/start`;
    if (action === "record-stop") url = `${API_BASE}/stream/${streamId}/record/stop`;

    console.log(`[Stream API] POST ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        Authorization: token || "",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    
    const data = await safeJsonParse(response);
    
    // For join/leave actions, return success even if backend fails (non-critical)
    if ((action === "join" || action === "leave") && (data.error || !response.ok)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error("[Stream API] POST error:", error);
    // For join/leave, return success (non-critical operations)
    if (action === "join" || action === "leave") {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
