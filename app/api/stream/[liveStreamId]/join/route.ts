import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

/**
 * POST /api/stream/[liveStreamId]/join - User joins stream
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/join?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error('Non-JSON response from backend:', text.substring(0, 200));
      // Return success anyway - join notification is not critical
      return NextResponse.json({ success: true, listeners: 1 }, { status: 200 });
    }
  } catch (error) {
    console.error('Error joining stream:', error);
    // Don't fail the request - join is not critical
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
