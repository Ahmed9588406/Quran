import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://noneffusive-reminiscent-tanna.ngrok-free.dev";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "20";
    const sort = searchParams.get("sort") || "createdAt,desc";

    // Get auth token from headers (client sends it in Authorization header)
    const authHeader = request.headers.get("authorization");
    
    console.log("GET /api/khateb_Studio/fatwas - Auth header:", authHeader ? "present" : "missing");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const url = `${API_BASE_URL}/api/v1/fatwas/pending?page=${page}&size=${size}&sort=${sort}`;
    console.log("Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fatwas API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch pending fatwas", status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pending fatwas:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

