import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://192.168.1.18:9001";
const LOGOUT_ENDPOINT = `${BASE_URL}/auth/logout`;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    // preserve raw body
    const raw = await req.text();

    // forward Authorization header if present
    const auth = req.headers.get("authorization") ?? "";

    const backendRes = await fetch(LOGOUT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") ?? "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: raw,
    });

    const text = await backendRes.text().catch(() => "");
    let parsed: any = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }

    if (parsed !== null) {
      return NextResponse.json(parsed, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // fallback plain text response
    return new NextResponse(text ?? "", {
      status: backendRes.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": backendRes.headers.get("content-type") ?? "text/plain",
      },
    });
  } catch (err) {
    console.error("Logout proxy error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 502, headers: corsHeaders() });
  }
}
