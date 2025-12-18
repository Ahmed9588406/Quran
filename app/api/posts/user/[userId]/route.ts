import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://apisoapp.twingroups.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "20";

    // Try to fetch user's posts from backend
    const backendUrl = `${BACKEND_URL}/posts/user/${userId}?page=${page}&per_page=${perPage}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      // If user posts endpoint doesn't exist, try the general posts endpoint with user filter
      const fallbackUrl = `${BACKEND_URL}/posts?user_id=${userId}&page=${page}&per_page=${perPage}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text().catch(() => "");
        console.error("Failed to fetch user posts:", fallbackResponse.status, errorText);
        return NextResponse.json(
          { posts: [], error: "Failed to fetch posts" },
          { status: 200, headers: corsHeaders() }
        );
      }

      const fallbackData = await fallbackResponse.json();
      const normalizedFallback = normalizePostsMedia(fallbackData);
      return NextResponse.json(normalizedFallback, { headers: corsHeaders() });
    }

    const data = await response.json();
    console.log(`[API] Raw response for user ${userId}:`, JSON.stringify(data, null, 2));
    
    // Log each post's media specifically
    if (data?.posts) {
      data.posts.forEach((post: any, index: number) => {
        console.log(`[API] Post ${index + 1} (${post.id}):`, {
          id: post.id,
          content: post.content?.substring(0, 50) + "...",
          media: post.media,
          media_count: Array.isArray(post.media) ? post.media.length : 'not array',
          raw_media: JSON.stringify(post.media)
        });
      });
    }
    
    // Normalize media URLs in posts
    const normalizedData = normalizePostsMedia(data);
    console.log(`[API] Normalized response for user ${userId}:`, JSON.stringify(normalizedData, null, 2));
    
    return NextResponse.json(normalizedData, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { posts: [], error: "Internal server error" },
      { status: 200, headers: corsHeaders() }
    );
  }
}

// Helper function to normalize media URLs in posts (comprehensive version from feed API)
function normalizePostsMedia(data: any) {
  if (!data?.posts || !Array.isArray(data.posts)) {
    console.log("[normalizePostsMedia] No posts found in data");
    return data;
  }
  
  console.log(`[normalizePostsMedia] Processing ${data.posts.length} posts`);
  
  data.posts = data.posts.map((post: any) => {
    const normalized = { ...post };
    
    // Normalize avatar_url
    if (typeof post.avatar_url === 'string' && post.avatar_url.startsWith('/')) {
      normalized.avatar_url = `${BACKEND_URL}${post.avatar_url}`;
    }
    
    // Some backend responses may not use `media`; normalize common variants into `media`.
    const rawMedia =
      (Array.isArray(post.media) ? post.media : null) ??
      (Array.isArray(post.media_files) ? post.media_files : null) ??
      (Array.isArray(post.attachments) ? post.attachments : null) ??
      (Array.isArray(post.files) ? post.files : null) ??
      (Array.isArray(post.images) ? post.images : null) ??
      (Array.isArray(post.videos) ? post.videos : null) ??
      null;

    console.log(`[normalizePostsMedia] Post ${post.id} raw media check:`, {
      media: post.media,
      media_files: post.media_files,
      attachments: post.attachments,
      files: post.files,
      images: post.images,
      videos: post.videos,
      rawMedia: rawMedia
    });

    if (rawMedia) {
      console.log(`[normalizePostsMedia] Post ${post.id} has ${rawMedia.length} media items:`, rawMedia);
      
      normalized.media = rawMedia.map((m: any) => {
        // String URL
        if (typeof m === 'string') {
          const url = m.startsWith('/') ? `${BACKEND_URL}${m}` : m;
          const lower = m.toLowerCase();
          const mediaType = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')
            ? 'video/mp4'
            : 'image/jpeg';
          return { url, media_url: url, media_type: mediaType };
        }

        // Object variant
        if (typeof m === 'object' && m !== null) {
          // Try multiple possible keys for the URL
          const candidate =
            (typeof m.media_url === 'string' && m.media_url) ||
            (typeof m.url === 'string' && m.url) ||
            (typeof m.file_url === 'string' && m.file_url) ||
            (typeof m.path === 'string' && m.path) ||
            (typeof m.src === 'string' && m.src) ||
            '';

          const normalizedUrl = candidate
            ? candidate.startsWith('/')
              ? `${BACKEND_URL}${candidate}`
              : candidate
            : '';

          const typeCandidate =
            (typeof m.media_type === 'string' && m.media_type) ||
            (typeof m.type === 'string' && m.type) ||
            (typeof m.mime === 'string' && m.mime) ||
            '';

          const result = {
            ...m,
            url: normalizedUrl || undefined,
            media_url: normalizedUrl || undefined,
            media_type: typeCandidate || (normalizedUrl.toLowerCase().includes('.mp4') ? 'video/mp4' : 'image/jpeg'),
          };
          
          console.log(`[normalizePostsMedia] Normalized media object:`, result);
          return result;
        }

        return m;
      });
    } else {
      // Ensure `media` exists for the UI (avoid undefined surprises)
      normalized.media = [];
      console.log(`[normalizePostsMedia] Post ${post.id} has no media, setting empty array`);
    }
    
    return normalized;
  });
  
  return data;
}
