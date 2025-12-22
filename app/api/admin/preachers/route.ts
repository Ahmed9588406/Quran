import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") || "100";

  try {
    const response = await fetch(`${API_BASE}/preachers/list?size=${size}`, {
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch preachers" }, { status: 500 });
  }
}
