import { NextRequest, NextResponse } from 'next/server';

// Use the stable backend URL
const BACKEND_URL = 'https://javabacked.twingroups.com/api/v1/stream';

/**
 * DELETE /api/stream/[liveStreamId]/room - Destroy room (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ liveStreamId: string }> }
) {
  try {
    const { liveStreamId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/${liveStreamId}/room`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error destroying room:', error);
    return NextResponse.json(
      { error: 'Failed to destroy room' },
      { status: 500 }
    );
  }
}
