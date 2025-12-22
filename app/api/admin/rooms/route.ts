import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") || "100";

  try {
    const response = await fetch(`${API_BASE}/stream/rooms?size=${size}`, {
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  const body = await request.json();

  try {
    const response = await fetch(`${API_BASE}/stream/rooms`, {
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
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
