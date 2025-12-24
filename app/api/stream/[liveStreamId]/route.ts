import { NextRequest, NextResponse } from 'next/server';

// Use the stable backend URL
const BACKEND_URL = 'https://javabacked.twingroups.com/api/v1/stream';

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

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching stream info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream info' },
      { status: 500 }
    );
  }
}
