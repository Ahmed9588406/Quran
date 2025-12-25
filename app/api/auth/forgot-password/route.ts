/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://apisoapp.twingroups.com";
const FORGOT_ENDPOINT = `${BASE_URL}/auth/forgot-password`;

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
    // Preserve raw body to forward exactly what client sent
    const raw = await req.text();
    const auth = req.headers.get("authorization") ?? "";

    const backendRes = await fetch(FORGOT_ENDPOINT, {
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

    return new NextResponse(text ?? "", {
      status: backendRes.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": backendRes.headers.get("content-type") ?? "text/plain",
      },
    });
  } catch (err) {
    console.error("Forgot-password proxy error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 502, headers: corsHeaders() });
  }
}
