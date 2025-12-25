import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

// Helper function to transform external reel data to internal format
// Supports both Feed format and User Reels format
function transformReel(item: any, defaultUser?: { id: string }) {
    // Determine fields based on source format
    const id = item.id;

    // Feed format uses author_id, User format implies user is known (or not provided in item)
    const userId = item.author_id || defaultUser?.id || '';

    // Feed format uses username/avatar_url, User format might be missing them
    const username = item.username || 'Unknown User';
    const userAvatar = item.avatar_url || null;

    // Feed format uses media_url, User format uses video_url (or potentially media_url)
    const videoUrl = item.media_url || item.video_url;

    // Feed format uses caption, User format uses content
    const content = item.caption || item.content;

    // Like stats
    const likesCount = item.likes_count ?? 0;
    const commentsCount = item.comments_count ?? 0;

    // Authored/Liked status
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
        is_saved: false, // Default
        is_following: false, // Default
        created_at: item.created_at,
        // Include comments if present
        comments: item.comments ? item.comments.map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            username: comment.username,
            display_name: comment.display_name,
            avatar_url: comment.avatar_url
        })) : undefined
    };
}

// Helper function to transform comment data
function transformComment(comment: any) {
    return {
        id: comment.id,
        reel_id: comment.reel_id,
        user_id: comment.user_id || comment.author_id,
        username: comment.username,
        user_avatar: comment.user_avatar || comment.avatar_url,
        content: comment.content,
        created_at: comment.created_at,
        likes_count: comment.likes_count || 0,
        is_liked: comment.is_liked || false,
    };
}

// Fetch comments for a reel
// Endpoint: GET /reels/{reel_id}/comments (try both /comment and /comments)
async function fetchReelComments(reelId: string, page: string, limit: string, authHeader: string | null) {
    // Try the /comments endpoint first (plural)
    let url = `${BACKEND_URL}/reels/${reelId}/comments?page=${page}&limit=${limit}`;
    
    console.log('[KhatebReels API] Fetching comments from:', url);

    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { 'Authorization': authHeader }),
        },
    });

    // If /comments returns 404, try /comment (singular)
    if (response.status === 404) {
        url = `${BACKEND_URL}/reels/${reelId}/comment?page=${page}&limit=${limit}`;
        console.log('[KhatebReels API] Trying singular endpoint:', url);
        
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
            },
        });
    }

    console.log('[KhatebReels API] Comments response status:', response.status);

    if (!response.ok) {
        // Return empty comments for 404 (endpoint may not exist or no comments)
        if (response.status === 404) {
            console.log('[KhatebReels API] Comments endpoint returned 404, returning empty list');
            return {
                comments: [],
                total_count: 0,
                page: parseInt(page),
                limit: parseInt(limit),
                has_more: false,
            };
        }
        const errorText = await response.text().catch(() => '');
        console.error('[KhatebReels API] Comments error:', errorText);
        throw new Error(`Comments API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[KhatebReels API] Comments raw response:', JSON.stringify(data).substring(0, 500));
    
    // Handle different response formats
    let rawComments: any[] = [];
    if (Array.isArray(data.comments)) {
        rawComments = data.comments;
    } else if (Array.isArray(data.data)) {
        rawComments = data.data;
    } else if (Array.isArray(data)) {
        rawComments = data;
    }

    const comments = rawComments.map(transformComment);

    return {
        comments,
        total_count: data.total_count || data.total || comments.length,
        page: parseInt(page),
        limit: parseInt(limit),
        has_more: comments.length >= parseInt(limit),
    };
}

// Create a comment on a reel
// Tries both /comments (plural) and /comment (singular) endpoints
async function createReelComment(reelId: string, content: string, authHeader: string | null, userData?: { id: string; username: string; avatar: string }) {
    // Try endpoints in order of likelihood
    const endpoints = [
        `${BACKEND_URL}/reels/${reelId}/comments`,  // Plural first (more common)
        `${BACKEND_URL}/reels/${reelId}/comment`,   // Singular fallback
    ];

    console.log('[KhatebReels API] Creating comment:', { reelId, content: content.substring(0, 50), hasAuth: !!authHeader });

    let lastError: Error | null = null;
    let lastStatus: number = 0;

    for (const url of endpoints) {
        console.log('[KhatebReels API] Trying POST to:', url);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader }),
                },
                body: JSON.stringify({ content }),
            });

            lastStatus = response.status;
            console.log('[KhatebReels API] Create comment response:', { url, status: response.status });

            // If this endpoint doesn't exist, try the next one
            if (response.status === 404) {
                console.log('[KhatebReels API] Endpoint returned 404, trying next...');
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.log('[KhatebReels API] Create comment error response:', errorText);
                throw new Error(`Create comment API error: ${response.status} - ${errorText}`);
            }

            // Success! Parse the response
            const data = await response.json().catch(() => ({ success: true }));
            console.log('[KhatebReels API] Create comment success response:', JSON.stringify(data).substring(0, 200));
            
            // If backend returns the comment, transform it
            if (data.comment) {
                console.log('[KhatebReels API] Backend returned comment object');
                return {
                    success: true,
                    comment: transformComment(data.comment),
                };
            }

            // If data itself is the comment
            if (data.id && (data.content || data.text)) {
                console.log('[KhatebReels API] Backend returned comment directly');
                return {
                    success: true,
                    comment: transformComment(data),
                };
            }

            // If backend returns data.data as the comment
            if (data.data && data.data.id) {
                console.log('[KhatebReels API] Backend returned comment in data.data');
                return {
                    success: true,
                    comment: transformComment(data.data),
                };
            }

            // If backend just returns success, create a local comment object
            console.log('[KhatebReels API] Backend returned success without comment object');
            return {
                success: true,
                comment: {
                    id: data.id || `backend_${Date.now()}`,
                    reel_id: reelId,
                    user_id: userData?.id || 'unknown',
                    username: userData?.username || 'You',
                    user_avatar: userData?.avatar || '',
                    content,
                    created_at: new Date().toISOString(),
                    likes_count: 0,
                    is_liked: false,
                }
            };
        } catch (error) {
            lastError = error as Error;
            console.log('[KhatebReels API] Error with endpoint:', url, error);
        }
    }

    // All endpoints returned 404 - return a temporary comment for UI
    if (lastStatus === 404) {
        console.log('[KhatebReels API] All comment endpoints returned 404, returning temp comment for UI');
        return {
            success: true,
            comment: {
                id: `temp_${Date.now()}`,
                reel_id: reelId,
                user_id: userData?.id || 'unknown',
                username: userData?.username || 'You',
                user_avatar: userData?.avatar || '',
                content,
                created_at: new Date().toISOString(),
                likes_count: 0,
                is_liked: false,
            }
        };
    }

    // If we got here, all requests failed with errors other than 404
    throw lastError || new Error('Failed to create comment');
}

async function fetchReelsFeed(page: string, limit: string | null, authHeader: string | null) {
    const url = new URL(`${BACKEND_URL}/reels`);
    url.searchParams.append('page', page);
    if (limit) {
        url.searchParams.append('limit', limit);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { 'Authorization': authHeader }),
        },
        next: { revalidate: 60 }
    });

    if (!response.ok) {
        throw new Error(`Feed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const reels = Array.isArray(data.reels) ? data.reels.map((item: any) => transformReel(item)) : [];

    return { ...data, reels };
}

async function fetchReelById(id: string, authHeader: string | null) {
    const url = `${BACKEND_URL}/reels/${id}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { 'Authorization': authHeader }),
        },
        next: { revalidate: 60 }
    });

    if (!response.ok) {
        throw new Error(`Reel API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const reel = data.reel ? transformReel(data.reel) : null;

    return { success: true, reel };
}

async function fetchUserReels(userId: string, authHeader: string | null) {
    const url = `${BACKEND_URL}/users/${userId}/reels`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { 'Authorization': authHeader }),
        },
        next: { revalidate: 60 }
    });

    if (!response.ok) {
        throw new Error(`User Reels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Pass userId as default since it's missing in the item
    const reels = Array.isArray(data.reels)
        ? data.reels.map((item: any) => transformReel(item, { id: userId }))
        : [];

    return { ...data, reels };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const userId = searchParams.get('user_id');
        const reelId = searchParams.get('reel_id');
        const action = searchParams.get('action');
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';
        const authHeader = request.headers.get('Authorization');

        // Handle GET comments for a reel
        // Usage: GET /khateb_Studio/reels/api?reel_id=xxx&action=comments&page=1&limit=20
        if (reelId && action === 'comments') {
            const data = await fetchReelComments(reelId, page, limit, authHeader);
            return NextResponse.json(data);
        }

        if (id) {
            const data = await fetchReelById(id, authHeader);
            return NextResponse.json(data);
        } else if (userId) {
            const data = await fetchUserReels(userId, authHeader);
            return NextResponse.json(data);
        } else {
            const data = await fetchReelsFeed(page, limit, authHeader);
            return NextResponse.json(data);
        }

    } catch (error: any) {
        console.error('Error in reels API route:', error);
        const status = error.message.includes('API error') ? 502 : 500;

        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status }
        );
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action'); // 'like', 'like_comment', or default (comment)
        const queryReelId = searchParams.get('reel_id');
        const commentId = searchParams.get('comment_id');

        // Parse body if present
        const body = await request.json().catch(() => ({}));
        const { reel_id, content } = body;

        // Use reel_id from query params or body
        const targetReelId = reel_id || queryReelId;

        if (!targetReelId) {
            return NextResponse.json(
                { success: false, message: 'Missing reel_id' },
                { status: 400 }
            );
        }

        // Handle like comment action
        if (action === 'like_comment') {
            if (!commentId) {
                return NextResponse.json(
                    { success: false, message: 'Missing comment_id' },
                    { status: 400 }
                );
            }

            const url = `${BACKEND_URL}/reels/${targetReelId}/comment/${commentId}/like`;

            console.log('[KhatebReels API] Liking comment:', { reelId: targetReelId, commentId });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader }),
                },
            });

            if (!response.ok) {
                // Return success for 404 (endpoint may not exist)
                if (response.status === 404) {
                    console.warn(`[KhatebReels API] Like comment returned 404`);
                    return NextResponse.json({ success: true, message: 'Like comment endpoint may not exist' });
                }
                console.error(`Like comment API error: ${response.status} ${response.statusText}`);
                return NextResponse.json(
                    { success: false, message: 'Failed to like comment' },
                    { status: response.status }
                );
            }

            const data = await response.json().catch(() => ({ success: true }));
            return NextResponse.json(data);
        }

        // Handle like reel action
        if (action === 'like') {
            const url = `${BACKEND_URL}/reels/${targetReelId}/like`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader }),
                },
            });

            if (!response.ok) {
                // Special handling for 404 on like
                if (response.status === 404) {
                    console.warn(`[KhatebReels API] Like failed with 404 for reel ${targetReelId}`);
                    // Return success for optimistic UI updates
                    return NextResponse.json({ success: true, message: 'Like endpoint may not exist' });
                }

                console.error(`[KhatebReels API] Like API error: ${response.status} ${response.statusText}`);
                return NextResponse.json(
                    { success: false, message: 'Failed to like on external API' },
                    { status: response.status }
                );
            }

            const data = await response.json().catch(() => ({ success: true }));
            return NextResponse.json(data);
        }

        // Handle comment creation (default action)
        // Usage: POST /khateb_Studio/reels/api?reel_id=xxx or POST with body { reel_id, content }
        if (!content) {
            return NextResponse.json(
                { success: false, message: 'Missing content for comment' },
                { status: 400 }
            );
        }

        // Extract user data from request headers (sent by client)
        const userDataHeader = request.headers.get('x-user-data');
        let userData = { id: '', username: '', avatar: '' };

        if (userDataHeader) {
            try {
                userData = JSON.parse(userDataHeader);
            } catch (e) {
                console.warn('[KhatebReels API] Failed to parse user data header:', e);
            }
        }

        const data = await createReelComment(targetReelId, content, authHeader, userData);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in reels POST API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const reelId = searchParams.get('reel_id');
        const commentId = searchParams.get('comment_id');

        if (!reelId) {
            return NextResponse.json(
                { success: false, message: 'Missing reel_id' },
                { status: 400 }
            );
        }

        // Handle unlike a reel
        if (action === 'like') {
            const url = `${BACKEND_URL}/reels/${reelId}/like`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader }),
                },
            });

            if (!response.ok) {
                // Return success for 404 (endpoint may not exist)
                if (response.status === 404) {
                    console.warn(`[KhatebReels API] Unlike returned 404 for reel ${reelId}`);
                    return NextResponse.json({ success: true, message: 'Unlike endpoint may not exist' });
                }
                console.error(`Unlike API error: ${response.status} ${response.statusText}`);
                return NextResponse.json(
                    { success: false, message: 'Failed to unlike on external API' },
                    { status: response.status }
                );
            }

            const data = await response.json().catch(() => ({ success: true }));
            return NextResponse.json(data);
        }

        // Handle delete comment
        if (action === 'delete_comment') {
            if (!commentId) {
                return NextResponse.json(
                    { success: false, message: 'Missing comment_id' },
                    { status: 400 }
                );
            }

            const url = `${BACKEND_URL}/reels/${reelId}/comment/${commentId}`;

            console.log('[KhatebReels API] Deleting comment:', { reelId, commentId });

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader }),
                },
            });

            if (!response.ok) {
                // Return success for 404 (endpoint may not exist or comment already deleted)
                if (response.status === 404) {
                    console.warn(`[KhatebReels API] Delete comment returned 404`);
                    return NextResponse.json({ success: true, message: 'Comment may already be deleted' });
                }
                console.error(`Delete comment API error: ${response.status} ${response.statusText}`);
                return NextResponse.json(
                    { success: false, message: 'Failed to delete comment' },
                    { status: response.status }
                );
            }

            const data = await response.json().catch(() => ({ success: true }));
            return NextResponse.json(data);
        }

        // Handle unlike comment
        if (action === 'like_comment') {
            if (!commentId) {
                return NextResponse.json(
                    { success: false, message: 'Missing comment_id' },
                    { status: 400 }
                );
            }

            const url = `${BACKEND_URL}/reels/${reelId}/comment/${commentId}/like`;

            console.log('[KhatebReels API] Unliking comment:', { reelId, commentId });

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader }),
                },
            });

            if (!response.ok) {
                // Return success for 404 (endpoint may not exist)
                if (response.status === 404) {
                    console.warn(`[KhatebReels API] Unlike comment returned 404`);
                    return NextResponse.json({ success: true, message: 'Unlike comment endpoint may not exist' });
                }
                console.error(`Unlike comment API error: ${response.status} ${response.statusText}`);
                return NextResponse.json(
                    { success: false, message: 'Failed to unlike comment' },
                    { status: response.status }
                );
            }

            const data = await response.json().catch(() => ({ success: true }));
            return NextResponse.json(data);
        }

        return NextResponse.json(
            { success: false, message: 'Invalid action for DELETE' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error in reels DELETE API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
