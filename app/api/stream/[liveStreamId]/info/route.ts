import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

/**
 * GET /api/stream/[liveStreamId]/info - Get stream info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const text = await response.text();
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error('Non-JSON response from backend:', text.substring(0, 200));
      // Return default info on parse error
      return NextResponse.json({ 
        id: parseInt(liveStreamId),
        status: 'UNKNOWN',
        listenerCount: 0 
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching stream info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream info', status: 'UNKNOWN' },
      { status: 200 }
    );
  }
}
