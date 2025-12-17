import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://apisoapp.twingroups.com";
const REFRESH_ENDPOINT = `${BASE_URL}/auth/refresh`;

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
    const raw = await req.text();

    const backendRes = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") ?? "application/json",
      },
      body: raw,
    });

    const text = await backendRes.text().catch(() => "");
    let parsed: any = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }

    if (parsed !== null) {
      return NextResponse.json(parsed, { status: backendRes.status, headers: corsHeaders() });
    }

    return new NextResponse(text ?? "", {
      status: backendRes.status,
      headers: { ...corsHeaders(), "Content-Type": backendRes.headers.get("content-type") ?? "text/plain" },
    });
  } catch (err) {
    console.error("Refresh proxy error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 502, headers: corsHeaders() });
  }
}
