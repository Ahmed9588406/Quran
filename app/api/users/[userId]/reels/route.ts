/**
 * Current User Reels API Route
 * 
 * GET /api/users/[userId]/reels - Fetch authenticated user's own reels with pagination
 * 
 * Requirements: 2.1 - Fetch reels from user-specific endpoint
 */

import { NextResponse } from "next/server";

const BASE_URL = "http://192.168.1.18:9001";

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
 * GET /api/users/[userId]/reels
 * Fetches the authenticated user's own reels with pagination
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 10)
 * 
 * Requirements: 2.1 - Fetch reels from GET /users/{user_id}/reels?limit=10&page=1
 * Requirements: 11.2 - Include Authorization header
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";
    
    const authHeader = request.headers.get("Authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendUrl = `${BASE_URL}/users/${userId}/reels?page=${page}&limit=${limit}`;
    const res = await fetch(backendUrl, {
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
    console.error("Error fetching current user reels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
