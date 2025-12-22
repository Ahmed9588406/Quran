import { NextRequest, NextResponse } from "next/server";

const JANUS_SERVER = "http://192.168.1.29:8088/janus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(JANUS_SERVER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Janus proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy to Janus" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const session = searchParams.get("session");
  const handle = searchParams.get("handle");
  
  let url = JANUS_SERVER;
  if (session) url += `/${session}`;
  if (handle) url += `/${handle}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Janus proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy to Janus" }, { status: 500 });
  }
}
