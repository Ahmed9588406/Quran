/**
 * Reels Feed API Route
 * 
 * GET /api/reels - Fetch reels feed with pagination
 * POST /api/reels - Create a new reel with video upload
 * 
 * Requirements: 1.1, 4.6, 11.1, 11.2
 */

import { NextResponse } from "next/server";

const BASE_URL = "http://192.168.1.18:9001";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

/**
 * GET /api/reels
 * Fetches the reels feed with pagination
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 10)
 * 
 * Requirements: 1.1 - Fetch and display reels from feed endpoint
 * Requirements: 11.2 - Include Authorization header
 */
export async function GET(request: Request) {
  try {
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

    const backendUrl = `${BASE_URL}/reels?page=${page}&limit=${limit}`;
    const res = await fetch(backendUrl, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to fetch reels: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching reels feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}


/**
 * POST /api/reels
 * Creates a new reel with video upload
 * 
 * Body: FormData with:
 * - video: File (required)
 * - content: string (required)
 * - visibility: 'public' | 'private' | 'followers' (required)
 * - thumbnail: File (optional)
 * 
 * Requirements: 4.6 - Upload via POST /reels with form-data
 * Requirements: 11.2 - Include Authorization header
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    
    // Validate required fields
    const video = formData.get("video");
    const content = formData.get("content");
    const visibility = formData.get("visibility");

    if (!video) {
      return NextResponse.json(
        { error: "Video file is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content/caption is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!visibility) {
      return NextResponse.json(
        { error: "Visibility is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Forward the form data to the backend
    // Don't set Content-Type - fetch will set it with boundary for multipart
    const headers: Record<string, string> = {
      Authorization: authHeader,
    };

    const res = await fetch(`${BASE_URL}/reels`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to create reel: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error creating reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
