import { NextRequest, NextResponse } from 'next/server';

// Use the stable backend URL
const BACKEND_URL = 'https://javabacked.twingroups.com/api/v1/stream';

/**
 * POST /api/stream/[liveStreamId]/record/start - Start recording
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/record/start`, {
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
    console.error('Error starting recording:', error);
    return NextResponse.json(
      { error: 'Failed to start recording' },
      { status: 500 }
    );
  }
}
