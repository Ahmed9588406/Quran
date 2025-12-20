/**
 * Media Upload API Route
 * 
 * POST - Upload and send media (image, video, audio)
 * 
 * Requirements: 6.1, 7.3
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/chats/[chatId]/media - Upload media
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    
    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create new FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('type', type);

    // Determine endpoint based on type
    const endpoint = `${BASE_URL}/chat/${chatId}/message/${type}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...(auth ? { Authorization: auth } : {}),
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 201,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
