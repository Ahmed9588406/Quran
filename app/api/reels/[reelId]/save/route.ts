/**
 * Reel Save API Route
 * 
 * POST /api/reels/[reelId]/save - Save a reel for later viewing
 * DELETE /api/reels/[reelId]/save - Unsave a reel
 * 
 * Requirements: 6.3 - Persist save state changes to backend
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
 * POST /api/reels/[reelId]/save
 * Saves a reel for later viewing
 * 
 * Requirements: 6.3 - Persist save state change to backend
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

    const res = await fetch(`${BASE_URL}/reels/${reelId}/save`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to save reel: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error saving reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * DELETE /api/reels/[reelId]/save
 * Unsaves a reel
 * 
 * Requirements: 6.3 - Persist save state change to backend
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

    const res = await fetch(`${BASE_URL}/reels/${reelId}/save`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to unsave reel: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error unsaving reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
