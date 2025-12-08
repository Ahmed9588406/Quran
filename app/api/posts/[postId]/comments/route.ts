import { NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') || '10';

  try {
    const backendRes = await fetch(
      `${BASE_URL}/posts/${encodeURIComponent(postId)}/comments?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch comments' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize avatar URLs in comments
    if (data?.comments && Array.isArray(data.comments)) {
      data.comments = data.comments.map((comment: any) => ({
        ...comment,
        author: comment.author ? {
          ...comment.author,
          avatar: comment.author.avatar?.startsWith('http') 
            ? comment.author.avatar 
            : comment.author.avatar 
              ? `${BASE_URL}${comment.author.avatar}`
              : null,
        } : comment.author,
        replies: comment.replies?.map((reply: any) => ({
          ...reply,
          author: reply.author ? {
            ...reply.author,
            avatar: reply.author.avatar?.startsWith('http')
              ? reply.author.avatar
              : reply.author.avatar
                ? `${BASE_URL}${reply.author.avatar}`
                : null,
          } : reply.author,
        })) || [],
      }));
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Comments proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    
    const backendRes = await fetch(
      `${BASE_URL}/posts/${encodeURIComponent(postId)}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to add comment' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    return NextResponse.json(data, { status: 201, headers: corsHeaders() });
  } catch (err) {
    console.error('Add comment proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
