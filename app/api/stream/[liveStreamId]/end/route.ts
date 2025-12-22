import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

/**
 * POST /api/stream/[liveStreamId]/end - End stream
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/end`, {
      method: 'POST',
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
      // Return success if we got a 2xx response even without valid JSON
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'Stream ended' }, { status: 200 });
      }
      return NextResponse.json({ success: false, error: 'Invalid response from server' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error ending stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end stream' },
      { status: 500 }
    );
  }
}
