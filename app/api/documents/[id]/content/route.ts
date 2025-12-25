import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://javabacked.twingroups.com/api/v1/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get authorization token from headers or query params
    let authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }

    console.log('Fetching document content for ID:', id);
    console.log('Backend URL:', `${BASE_URL}/${id}/content`);

    // Fetch from backend
    const response = await fetch(`${BASE_URL}/${id}/content`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store',
    });

    console.log('Backend status:', response.status);
    console.log('Backend content-type:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch document', details: errorText },
        { status: response.status }
      );
    }

    // Stream the response body directly
    if (!response.body) {
      return NextResponse.json(
        { error: 'No response body from backend' },
        { status: 500 }
      );
    }

    // Read all chunks into a single buffer
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        totalLength += value.length;
      }
    }

    console.log('Total bytes received:', totalLength);

    if (totalLength === 0) {
      return NextResponse.json(
        { error: 'Backend returned empty document' },
        { status: 500 }
      );
    }

    // Combine chunks into single array
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return new NextResponse(combined, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"',
        'Content-Length': totalLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
