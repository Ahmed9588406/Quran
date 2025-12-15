/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://192.168.1.18:9001";

/**
 * POST /api/posts
 * Create a new post with optional media files
 * 
 * Expected request:
 * - Headers: Authorization: Bearer <token>
 * - Body: FormData with:
 *   - content: string (post text)
 *   - visibility: "public" | "friends" | "private"
 *   - files: File[] (optional, images or videos)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Parse form data
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const visibility = (formData.get("visibility") as string) || "public";
    const files = formData.getAll("files") as File[];

    // Validate content
    if (!content || content.trim().length === 0) {
      if (files.length === 0) {
        return NextResponse.json(
          { error: "Post must have content or media" },
          { status: 400 }
        );
      }
    }

    // Create FormData for backend
    const backendFormData = new FormData();
    backendFormData.append("content", content || "");
    backendFormData.append("visibility", visibility);

    // Add files to backend FormData
    for (const file of files) {
      backendFormData.append("files", file);
    }

    // Send to backend
    const response = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Backend returned ${response.status}`,
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create post" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts
 * Fetch posts (optional query parameters)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.substring(7);

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BASE_URL}/posts?limit=${limit}&offset=${offset}`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
