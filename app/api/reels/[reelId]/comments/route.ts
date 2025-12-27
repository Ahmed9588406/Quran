/**
 * Reels Comments API Route
 * 
 * Fetches comments for a reel from GET /reels/{reel_id}
 * The backend returns comments embedded in the reel response.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

// Helper function to transform comment data
function transformComment(comment: any, reelId: string) {
    return {
        id: comment.id,
        reel_id: reelId,
        user_id: comment.user_id || comment.author_id || '',
        username: comment.display_name || comment.username || 'User',
        user_avatar: comment.avatar_url || '',
        content: comment.content,
        created_at: comment.created_at,
        likes_count: comment.likes_count || 0,
        is_liked: comment.is_liked || false,
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

        console.log('[Reels Comments API] Fetching reel with comments:', reelId);

        // Fetch the reel which includes comments
        const response = await fetch(`${BACKEND_URL}/reels/${reelId}`, {
            method: 'GET',
            headers,
        });

        console.log('[Reels Comments API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('[Reels Comments API] Backend error:', errorText);
            
            // Return empty comments for errors
            return NextResponse.json({
                comments: [],
                has_more: false,
                total: 0,
            });
        }

        const data = await response.json();
        console.log('[Reels Comments API] Response success:', data.success);

        // Extract and transform comments from the reel response
        let comments: any[] = [];
        
        if (data.success && data.reel && Array.isArray(data.reel.comments)) {
            comments = data.reel.comments.map((c: any) => transformComment(c, reelId));
        }

        console.log('[Reels Comments API] Returning', comments.length, 'comments');

        return NextResponse.json({
            comments,
            has_more: false,
            total: data.reel?.comments_count || comments.length,
        });
    } catch (error) {
        console.error('[Reels Comments API] Error:', error);
        return NextResponse.json({
            comments: [],
            has_more: false,
            total: 0,
            error: 'Internal server error',
        });
    }
}
