import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

/**
 * GET /api/stream/rooms/[id] - Get room by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/rooms/${id}`, {
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
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stream/rooms/[id] - Delete room (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}
