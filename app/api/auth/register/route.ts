/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://192.168.1.18:9001";
const REGISTER_ENDPOINT = `${BASE_URL}/auth/register`;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function serializeCookie(
  name: string,
  value: string,
  opts: {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    path?: string;
    sameSite?: string;
  }
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  parts.push(`Path=${opts.path ?? "/"}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join("; ");
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.username || !body?.email || !body?.password || !body?.full_name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const backendRes = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { success: false }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Extract tokens and user
    const accessToken = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken ?? data?.data?.access_token;
    const refreshToken = data?.refreshToken ?? data?.refresh_token ?? data?.data?.refreshToken ?? data?.data?.refresh_token;
    const expiresIn = Number(data?.expiresIn ?? data?.expires_in ?? 0) || undefined;

    // Normalize user avatar if needed
    let user = data?.user ?? data?.data?.user ?? null;
    if (user && typeof user.avatar_url === "string" && user.avatar_url.startsWith("/")) {
      user.avatar_url = `${BASE_URL}${user.avatar_url}`;
    }

    // Build cookies
    const secure = process.env.NODE_ENV === "production";
    const cookies: string[] = [];

    if (accessToken) {
      cookies.push(
        serializeCookie("accessToken", accessToken, {
          maxAge: expiresIn ?? 60 * 60 * 24 * 7,
          httpOnly: true,
          secure,
          path: "/",
          sameSite: "Lax",
        })
      );
    }

    if (refreshToken) {
      cookies.push(
        serializeCookie("refreshToken", refreshToken, {
          maxAge: 60 * 60 * 24 * 30,
          httpOnly: true,
          secure,
          path: "/",
          sameSite: "Lax",
        })
      );
    }

    // Prepare response body
    const responseBody = {
      success: true,
      user_id: user?.id ?? data?.user_id ?? null,
      user: user,
      tokens: { access_token: accessToken, refresh_token: refreshToken },
    };

    const response = NextResponse.json(responseBody, {
      status: 200,
      headers: corsHeaders(),
    });

    for (const cookie of cookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (err) {
    console.error("Register proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 502, headers: corsHeaders() }
    );
  }
}
