/**
 * User Reels API Route
 * 
 * GET /api/reels/user/[userId] - Fetch reels for a specific user (other user's profile)
 * 
 * Requirements: 3.1 - Fetch reels from another user's endpoint
 */

import { NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

/**
 * GET /api/reels/user/[userId]
 * Fetches reels for a specific user (viewing another user's profile)
 * 
 * Requirements: 3.1 - Fetch reels from that user's endpoint (GET /reels/{user_id})
 * Requirements: 11.2 - Include Authorization header
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authHeader = request.headers.get("Authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(`${BASE_URL}/reels/${userId}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to fetch user reels: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching user reels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
