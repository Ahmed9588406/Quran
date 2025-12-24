import { NextRequest, NextResponse } from 'next/server';

// Use the stable backend URL
const BACKEND_URL = 'https://javabacked.twingroups.com/api/v1/stream';

/**
 * POST /api/stream/[liveStreamId]/record/stop - Stop recording
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/record/stop`, {
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
    console.error('Error stopping recording:', error);
    return NextResponse.json(
      { error: 'Failed to stop recording' },
      { status: 500 }
    );
  }
}
