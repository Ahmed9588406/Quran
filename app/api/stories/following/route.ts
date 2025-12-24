import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://apisoapp.twingroups.com";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BASE_URL}/stories/following?limit=${limit}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stories following API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch stories", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log the actual response structure for debugging
    console.log("Stories following API raw response:", JSON.stringify(data).substring(0, 500));
    console.log("Response keys:", Object.keys(data));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Stories following API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
