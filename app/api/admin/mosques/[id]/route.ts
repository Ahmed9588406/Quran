import { NextRequest, NextResponse } from "next/server";

// Use the stable backend URL
const API_BASE = "https://javabacked.twingroups.com/api/v1";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get("authorization");

  try {
    const response = await fetch(`${API_BASE}/mosques/${id}`, {
      method: "DELETE",
      headers: { Authorization: token || "" },
    });
    if (response.ok) {
      return NextResponse.json({ success: true });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete mosque" }, { status: 500 });
  }
}
