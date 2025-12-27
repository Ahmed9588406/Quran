/**
 * Single Reel API Route
 * 
 * Proxies requests to get a specific reel with all its content.
 * Endpoint: GET /reels/{reel_id}
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

// Helper function to transform external reel data to internal format
function transformReel(item: any) {
    const id = item.id;
    const userId = item.author_id || '';
    const username = item.display_name || item.username || 'Unknown User';
    const userAvatar = item.avatar_url || null;
    const videoUrl = item.media_url || item.video_url;
    const content = item.caption || item.content || '';
    const likesCount = item.likes_count ?? 0;
    const commentsCount = item.comments_count ?? 0;
    const isLiked = item.liked_by_me ?? item.liked_by_current_user ?? false;

    return {
        id,
        user_id: userId,
        username,
        user_avatar: userAvatar,
        video_url: videoUrl,
        thumbnail_url: item.thumbnail_url || null,
        content,
        visibility: (item.visibility as 'public' | 'private' | 'followers') || 'public',
        likes_count: likesCount,
        comments_count: commentsCount,
        is_liked: isLiked,
        is_saved: item.is_saved ?? false,
        is_following: item.is_following ?? false,
        created_at: item.created_at,
        comments: item.comments ? item.comments.map((comment: any) => ({
            id: comment.id,
            reel_id: id,
            user_id: comment.user_id || comment.author_id || '',
            content: comment.content,
            created_at: comment.created_at,
            username: comment.display_name || comment.username || 'User',
            user_avatar: comment.avatar_url || '',
            likes_count: comment.likes_count || 0,
            is_liked: comment.is_liked || false,
        })) : undefined
    };
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ reelId: string }> }
) {
    try {
        const params = await props.params;
        const { reelId } = params;
        const token = request.headers.get('authorization');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token;
        }

        console.log('[Reel API] Fetching reel:', reelId);

        const response = await fetch(`${BACKEND_URL}/reels/${reelId}`, {
            method: 'GET',
            headers,
        });

        console.log('[Reel API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('[Reel API] Backend error:', errorText);
            
            return NextResponse.json(
                { error: 'Failed to fetch reel', success: false },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[Reel API] Response success:', data.success);

        const reel = data.reel ? transformReel(data.reel) : null;

        return NextResponse.json({
            success: true,
            reel,
        });
    } catch (error) {
        console.error('[Reel API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}
