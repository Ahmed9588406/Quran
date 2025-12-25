import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";

// POST /api/stories/{storyId}/view - Mark story as viewed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: storyId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    };

    const response = await fetch(`${BASE_URL}/stories/${storyId}/view`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mark story viewed API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to mark story as viewed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Mark story viewed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
