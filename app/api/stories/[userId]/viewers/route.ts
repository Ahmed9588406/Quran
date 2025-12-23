import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";

// GET /api/stories/{storyId}/viewers - Get users who viewed the story
export async function GET(
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

    const response = await fetch(`${BASE_URL}/stories/${storyId}/viewers`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get story viewers API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to get story viewers", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get story viewers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
