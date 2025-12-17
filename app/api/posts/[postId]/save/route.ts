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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Extract token from Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Decode JWT to get user_id (basic parsing)
    let userId: string | null = null;
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const decoded = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8")
        );
        userId = decoded.sub || decoded.user_id || decoded.id;
      }
    } catch (e) {
      console.error("Failed to decode token:", e);
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Could not extract user_id from token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: authHeader,
    };

    // Backend endpoint: POST /posts/{postId}/save
    const res = await fetch(`${BASE_URL}/posts/${postId}/save`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to save post: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(
      { success: true, message: data.message || "Post saved successfully" },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error saving post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
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

    // Backend endpoint: DELETE /posts/{postId}/save
    const res = await fetch(`${BASE_URL}/posts/${postId}/save`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to unsave post: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(
      { success: true, message: data.message || "Post unsaved successfully" },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error unsaving post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
