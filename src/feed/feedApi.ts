/* eslint-disable @typescript-eslint/no-explicit-any */
// Use local API proxy to avoid CORS issues
const API_URL = "/api/feed";

export type FeedMedia = {
	url: string;
	media_type: string;
};

export type FeedPost = {
	id: string;
	user_id?: string | number;
	author_id?: string | number;
	content?: string;
	username?: string;
	display_name?: string;
	avatar_url?: string;
	created_at?: string;
	likes_count?: number;
	comments_count?: number;
	liked_by_me?: boolean;
	is_following?: boolean | number;
	media?: { url: string; media_type: string }[];
};

export type FeedResponse = {
	success?: boolean;
	posts: FeedPost[];
	page?: number;
	stories?: any[];
};

/** Fetch feed from local API proxy */
export async function fetchFeed(
	page = 1,
	per_page = 10,
	token?: string
): Promise<FeedResponse> {
	const url = `${API_URL}?page=${encodeURIComponent(String(page))}&per_page=${encodeURIComponent(String(per_page))}`;
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (token) headers["Authorization"] = `Bearer ${token}`;

	const res = await fetch(url, { method: "GET", headers });
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText} ${text}`);
	}

	const data = await res.json().catch(() => ({}));
	// Posts are already normalized by the API proxy
	return {
		success: data.success ?? true,
		posts: Array.isArray(data.posts) ? data.posts : [],
		page: data.page ?? page,
		stories: data.stories ?? [],
	};
}
