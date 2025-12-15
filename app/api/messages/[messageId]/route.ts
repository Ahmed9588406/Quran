/**
 * Message Operations API Route
 * 
 * DELETE - Delete a message
 * 
 * Requirements: 9.2
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * DELETE /api/messages/[messageId] - Delete a message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const auth = req.headers.get('authorization') ?? '';

    const response = await fetch(`${BASE_URL}/chat/message/${messageId}`, {
      method: 'DELETE',
      headers: {
        ...(auth ? { Authorization: auth } : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
