import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

/**
 * GET /api/stream/[liveStreamId]/listeners - Get listener count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/listeners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const text = await response.text();
    
    // Try to parse as JSON, return default if not valid
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      // If backend returns non-JSON (e.g., HTML error page), return default
      console.error('Non-JSON response from backend:', text.substring(0, 200));
      return NextResponse.json({ listeners: 0, liveStreamId: parseInt(liveStreamId) }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching listeners:', error);
    // Return default listener count on error to prevent UI breaking
    return NextResponse.json({ listeners: 0 }, { status: 200 });
  }
}
