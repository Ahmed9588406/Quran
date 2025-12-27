/**
 * Reels Feed API Route
 * 
 * Proxies requests to get the reels feed.
 * Endpoint: GET /reels
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

/**
 * Transforms external reel data to internal format
 */
function transformReel(item: any, defaultUser?: { id: string }) {
    const id = item.id;
    const userId = item.author_id || defaultUser?.id || '';
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

/**
 * GET /api/reels
 * Proxies GET requests to the reels endpoint
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token;
        }

        console.log('[Reels Feed API] Fetching reels, page:', page, 'limit:', limit);

        const url = new URL(`${BACKEND_URL}/reels`);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', limit);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
        });

        console.log('[Reels Feed API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('[Reels Feed API] Backend error:', errorText);
            
            return NextResponse.json(
                { error: 'Failed to fetch reels', reels: [], success: false },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[Reels Feed API] Response:', { 
            success: data.success, 
            reelsCount: data.reels?.length || 0,
            page: data.page 
        });

        // Transform reels array
        const reels = Array.isArray(data.reels) 
            ? data.reels.map((item: any) => transformReel(item)) 
            : [];

        console.log('[Reels Feed API] Returning', reels.length, 'reels');

        return NextResponse.json({
            success: data.success ?? true,
            reels,
            page: data.page || parseInt(page),
            has_more: reels.length >= parseInt(limit),
        });
    } catch (error) {
        console.error('[Reels Feed API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', reels: [], success: false },
            { status: 500 }
        );
    }
}
