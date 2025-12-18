/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";

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
    
    // Get files - support both "files" and "file" field names
    const filesFromFiles = formData.getAll("files") as File[];
    const filesFromFile = formData.getAll("file") as File[];
    const allFiles = [...filesFromFiles, ...filesFromFile];

    // Log received data
    console.log("=== RECEIVED POST DATA ===");
    console.log("Content:", content);
    console.log("Visibility:", visibility);
    console.log("Files received:", allFiles.length);
    allFiles.forEach((f, i) => {
      console.log(`  File ${i + 1}: ${f.name} (${f.type}, ${f.size} bytes)`);
    });
    console.log("==========================");

    // Validate content - allow posts with just media (no content)
    if ((!content || content.trim().length === 0) && allFiles.length === 0) {
      return NextResponse.json(
        { error: "Post must have content or media" },
        { status: 400 }
      );
    }

    // Create FormData for backend - match Postman format exactly
    const backendFormData = new FormData();
    
    // Only append content if it exists
    if (content && content.trim()) {
      backendFormData.append("content", content.trim());
    }
    backendFormData.append("visibility", visibility);

    // Add files to backend FormData - use "file" key (matching Postman)
    for (const file of allFiles) {
      backendFormData.append("file", file, file.name);
    }

    // Log what we're sending to backend
    console.log("=== SENDING TO BACKEND ===");
    for (const [key, value] of backendFormData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("==========================");

    // Send to backend
    const response = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    const result = await response.json().catch(() => ({
      error: `Backend returned ${response.status}`,
    }));

    // Log the backend response for debugging
    console.log("=== BACKEND POST CREATION RESPONSE ===");
    console.log("Backend Status:", response.status);
    console.log("Backend Response:", JSON.stringify(result, null, 2));
    console.log("Files sent:", allFiles.length, "files");
    console.log("File names:", allFiles.map(f => f.name).join(", "));
    console.log("======================================");

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

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
