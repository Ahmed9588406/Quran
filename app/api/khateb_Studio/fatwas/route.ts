import { NextRequest, NextResponse } from "next/server";

// Use the stable backend URL
const API_BASE_URL = "https://javabacked.twingroups.com";

/**
 * GET /api/khateb_Studio/fatwas
 * Fetches fatwas for the authenticated preacher by status
 * 
 * Query Parameters:
 * - status: pending | answered | rejected (default: pending)
 * - page: Page number (default: 0)
 * - size: Items per page (default: 20)
 * - sort: Sort order (default: createdAt,desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "20";
    const sort = searchParams.get("sort") || "createdAt,desc";

    // Get auth token from headers (client sends it in Authorization header)
    const authHeader = request.headers.get("authorization");
    
    console.log(`GET /api/khateb_Studio/fatwas - Status: ${status}, Auth header:`, authHeader ? "present" : "missing");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Build URL based on status
    const url = `${API_BASE_URL}/api/v1/fatwas/${status}?page=${page}&size=${size}&sort=${sort}`;
    console.log("Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fatwas API error (${status}):`, response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch ${status} fatwas`, status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching fatwas:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/khateb_Studio/fatwas
 * Submits an answer to a fatwa
 * 
 * Query Parameters:
 * - fatwaId: The ID of the fatwa to answer
 * 
 * Request Body:
 * {
 *   "answer": "The preacher's answer text"
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fatwaId = searchParams.get("fatwaId");

    if (!fatwaId) {
      return NextResponse.json(
        { error: "Missing fatwaId parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answer } = body;

    if (!answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid answer field" },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 401 }
      );
    }

    console.log("[API] Submitting answer for fatwa:", {
      fatwaId,
      answerLength: answer.length,
      hasAuth: !!authHeader,
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": authHeader,
      "ngrok-skip-browser-warning": "true",
    };

    // Call the backend API endpoint to submit the answer
    const apiUrl = `${API_BASE_URL}/api/v1/fatwas/${fatwaId}/answer`;
    
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({ answer: answer.trim() }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Answer submission failed:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to submit answer", status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API] ✓ Answer submitted successfully for fatwa:", fatwaId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error submitting answer:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/khateb_Studio/fatwas
 * Rejects a fatwa
 * 
 * Query Parameters:
 * - fatwaId: The ID of the fatwa to reject
 * 
 * This endpoint proxies to: PUT /api/v1/fatwas/{fatwaId}/reject
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fatwaId = searchParams.get("fatwaId");

    if (!fatwaId) {
      return NextResponse.json(
        { error: "Missing fatwaId parameter" },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 401 }
      );
    }

    console.log("[API] Rejecting fatwa:", {
      fatwaId,
      hasAuth: !!authHeader,
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": authHeader,
      "ngrok-skip-browser-warning": "true",
    };

    // Call the backend API endpoint to reject the fatwa
    // Backend endpoint: PUT /api/v1/fatwas/{fatwaId}/reject
    const apiUrl = `${API_BASE_URL}/api/v1/fatwas/${fatwaId}/reject`;
    
    console.log("[API] Calling reject endpoint:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "PUT", // Backend uses PUT for reject
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Fatwa rejection failed:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to reject fatwa", status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API] ✓ Fatwa rejected successfully:", fatwaId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error rejecting fatwa:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

