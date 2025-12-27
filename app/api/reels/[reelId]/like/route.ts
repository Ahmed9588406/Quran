/**
 * Reels Like/Unlike API Route
 * 
 * Handles like and unlike actions for reels.
 * POST - Like a reel
 * DELETE - Unlike a reel
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

export async function POST(
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

        console.log('[Reel Like API] Liking reel:', reelId);

        const response = await fetch(`${BACKEND_URL}/reels/${reelId}/like`, {
            method: 'POST',
            headers,
        });

        console.log('[Reel Like API] Response status:', response.status);

        if (!response.ok) {
            if (response.status === 404) {
                console.warn('[Reel Like API] Like endpoint returned 404');
                return NextResponse.json({ success: true, message: 'Like endpoint may not exist' });
            }
            
            return NextResponse.json(
                { success: false, message: 'Failed to like reel' },
                { status: response.status }
            );
        }

        const data = await response.json().catch(() => ({ success: true }));
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Reel Like API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        console.log('[Reel Unlike API] Unliking reel:', reelId);

        const response = await fetch(`${BACKEND_URL}/reels/${reelId}/like`, {
            method: 'DELETE',
            headers,
        });

        console.log('[Reel Unlike API] Response status:', response.status);

        if (!response.ok) {
            if (response.status === 404) {
                console.warn('[Reel Unlike API] Unlike endpoint returned 404');
                return NextResponse.json({ success: true, message: 'Unlike endpoint may not exist' });
            }
            
            return NextResponse.json(
                { success: false, message: 'Failed to unlike reel' },
                { status: response.status }
            );
        }

        const data = await response.json().catch(() => ({ success: true }));
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Reel Unlike API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}
