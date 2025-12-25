/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://apisoapp.twingroups.com";
const ENDPOINTS = [`${BASE_URL}/auth/me`, `${BASE_URL}/auth/profile`, `${BASE_URL}/user/profile`];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") ?? "";

    for (const ep of ENDPOINTS) {
      try {
        const backendRes = await fetch(ep, {
          method: "GET",
          headers: {
            ...(auth ? { Authorization: auth } : {}),
          },
        });

        // if unauthorized, return that status immediately
        if (backendRes.status === 401 || backendRes.status === 403) {
          const text = await backendRes.text().catch(() => "");
          let parsed: any = null;
          try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
          if (parsed !== null) {
            return NextResponse.json(parsed, { status: backendRes.status, headers: corsHeaders() });
          }
          return new NextResponse(text ?? "", { status: backendRes.status, headers: corsHeaders() });
        }

        if (backendRes.ok) {
          const text = await backendRes.text().catch(() => "");
          let parsed: any = null;
          try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }

          // normalize avatar_url if present and relative
          if (parsed && parsed.data && parsed.data.user && typeof parsed.data.user.avatar_url === "string") {
            const avatar = parsed.data.user.avatar_url;
            if (avatar && avatar.startsWith("/")) parsed.data.user.avatar_url = `${BASE_URL}${avatar}`;
          }

          if (parsed !== null) {
            return NextResponse.json(parsed, { status: backendRes.status, headers: corsHeaders() });
          }

          return new NextResponse(text ?? "", { status: backendRes.status, headers: { ...corsHeaders(), "Content-Type": backendRes.headers.get("content-type") ?? "text/plain" } });
        }
      } catch (e) {
        // try next endpoint
        continue;
      }
    }

    // none succeeded; fallback
    return NextResponse.json({ success: false, message: "Profile fetch failed" }, { status: 502, headers: corsHeaders() });
  } catch (err) {
    console.error("Profile proxy error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 502, headers: corsHeaders() });
  }
}
