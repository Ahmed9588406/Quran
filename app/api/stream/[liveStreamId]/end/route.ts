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

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error ending stream:', error);
    return NextResponse.json(
      { error: 'Failed to end stream' },
      { status: 500 }
    );
  }
}
