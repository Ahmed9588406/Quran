/**
 * Reel Like API Route
 * 
 * POST /api/reels/[reelId]/like - Like a reel
 * DELETE /api/reels/[reelId]/like - Unlike a reel
 * 
 * Requirements: 5.3 - Persist like state changes to backend
 */

import { NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

/**
 * POST /api/reels/[reelId]/like
 * Likes a reel
 * 
 * Requirements: 5.3 - Persist like state change to backend
 * Requirements: 11.2 - Include Authorization header
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ reelId: string }> }
) {
  try {
    const { reelId } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: authHeader,
    };

    const res = await fetch(`${BASE_URL}/reels/${reelId}/like`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to like reel: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error liking reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * DELETE /api/reels/[reelId]/like
 * Unlikes a reel
 * 
 * Requirements: 5.3 - Persist like state change to backend
 * Requirements: 11.2 - Include Authorization header
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reelId: string }> }
) {
  try {
    const { reelId } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: authHeader,
    };

    const res = await fetch(`${BASE_URL}/reels/${reelId}/like`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to unlike reel: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error unliking reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
