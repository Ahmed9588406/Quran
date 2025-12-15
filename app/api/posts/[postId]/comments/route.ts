import { NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";

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

// POST - Add a comment to a post
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

    const body = await request.json();
    const { content, image_url, parent_comment_id } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required and must be a non-empty string" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Build request body - image_url and parent_comment_id are optional
    const requestBody: { content: string; image_url?: string; parent_comment_id?: string } = {
      content: content.trim(),
    };

    if (image_url && typeof image_url === "string" && image_url.trim() !== "") {
      requestBody.image_url = image_url.trim();
    }

    // If parent_comment_id is provided, this is a reply to a comment
    if (parent_comment_id && typeof parent_comment_id === "string" && parent_comment_id.trim() !== "") {
      requestBody.parent_comment_id = parent_comment_id.trim();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: authHeader,
    };

    const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to add comment: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET - Get all comments for a post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const authHeader = request.headers.get("Authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to get comments: ${res.status} ${text}` },
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error getting comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
