import { NextRequest, NextResponse } from "next/server";

// Use the stable backend URL
const API_BASE = "https://javabacked.twingroups.com/api/v1";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  let token = request.headers.get("authorization") || "";
  
  // Fix malformed token: Remove extra quotes around the JWT if present
  // e.g., 'Bearer "eyJ..."' -> 'Bearer eyJ...'
  if (token.includes('"')) {
    token = token.replace(/"/g, '');
  }
  
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") || "100";

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${API_BASE}/preachers/list?size=${size}`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: "Backend error", details: errorText, status: response.status },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: corsHeaders });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error fetching preachers:", error);
    
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout", details: "Backend server took too long to respond" },
        { status: 504, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch preachers", details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
