import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/stream/room-info
 * Fetches preacher's live stream room information
 */
export async function GET(request: NextRequest) {
  try {
    // Get preacherId from query params
    const { searchParams } = new URL(request.url);
    const preacherId = searchParams.get("preacherId");

    if (!preacherId) {
      return NextResponse.json(
        { error: "preacherId is required" },
        { status: 400 }
      );
    }

    // Get auth token from Authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 401 }
      );
    }

    console.log(`[API] Fetching room info for preacher: ${preacherId}`);

    // Build headers with authentication
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    };

    // Fetch room info from backend
    const response = await fetch(
      `https://javabacked.twingroups.com/api/v1/stream/preacher/${preacherId}/room-info`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch room info", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API] ✓ Room info fetched successfully");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching room info:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
