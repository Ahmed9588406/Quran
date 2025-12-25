import { NextRequest, NextResponse } from "next/server";

// Use the stable backend URL
const API_BASE = "https://javabacked.twingroups.com/api/v1";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") || "100";

  try {
    const response = await fetch(`${API_BASE}/mosques?size=${size}`, {
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mosques" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  const body = await request.json();

  try {
    const response = await fetch(`${API_BASE}/mosques`, {
      method: "POST",
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create mosque" }, { status: 500 });
  }
}
