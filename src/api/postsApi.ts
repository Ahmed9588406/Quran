export type Post = {
	id: string;
	title?: string;
	body?: string;
	createdAt?: string;
	// ...other post fields...
};

export type PostsResponse = {
	posts: Post[];
	total?: number;
	limit?: number;
	page?: number;
};

export async function fetchUserPosts(
	userId: string | number,
	options?: { limit?: number; page?: number; token?: string }
): Promise<PostsResponse> {
	const limit = options?.limit ?? 20;
	const page = options?.page ?? 1;
	const token = options?.token;

	const url = `http://192.168.1.18:9001/users/${encodeURIComponent(
		String(userId)
	)}/posts?limit=${limit}&page=${page}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(url, { method: 'GET', headers });
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Failed to load posts: ${res.status} ${res.statusText} ${text}`);
	}
	// Expecting JSON: adapt if your backend wraps differently
	const data = await res.json();
	// Normalize common shapes: { posts } or { data: posts, meta: { total, page, limit } }
	if (Array.isArray(data)) {
		return { posts: data, page, limit };
	}
	if (data.posts) {
		return {
			posts: data.posts,
			total: data.total ?? data.meta?.total,
			limit: data.limit ?? data.meta?.limit ?? limit,
			page: data.page ?? data.meta?.page ?? page,
		};
	}
	if (data.data && Array.isArray(data.data)) {
		return {
			posts: data.data,
			total: data.meta?.total,
			limit: data.meta?.limit ?? limit,
			page: data.meta?.page ?? page,
		};
	}
	// fallback
	return { posts: [], page, limit };
}

export type LikeCommentResponse = {
	success: boolean;
	message?: string;
	likesCount?: number;
};

export async function likeComment(
	commentId: string | number,
	token?: string
): Promise<LikeCommentResponse> {
	// Use local API route to avoid CORS issues
	const url = `/api/comments/${encodeURIComponent(String(commentId))}/like`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(url, { method: 'POST', headers });
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Failed to like comment: ${res.status} ${res.statusText} ${text}`);
	}

	const data = await res.json();
	return {
		success: true,
		message: data.message,
		likesCount: data.likesCount ?? data.likes_count ?? data.likes,
	};
}

export async function unlikeComment(
	commentId: string | number,
	token?: string
): Promise<LikeCommentResponse> {
	// Use local API route to avoid CORS issues
	const url = `/api/comments/${encodeURIComponent(String(commentId))}/like`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(url, { method: 'DELETE', headers });
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Failed to unlike comment: ${res.status} ${res.statusText} ${text}`);
	}

	const data = await res.json();
	return {
		success: true,
		message: data.message,
		likesCount: data.likesCount ?? data.likes_count ?? data.likes,
	};
}

export type AddCommentResponse = {
	success: boolean;
	comment?: {
		id: string;
		content: string;
		image_url?: string;
		created_at: string;
		author?: {
			id: string;
			username: string;
			display_name?: string;
			avatar_url?: string;
		};
	};
	message?: string;
};

export async function addComment(
	postId: string | number,
	content: string,
	imageUrl?: string,
	token?: string
): Promise<AddCommentResponse> {
	// Use local API route to avoid CORS issues
	const url = `/api/posts/${encodeURIComponent(String(postId))}/comments`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const body: { content: string; image_url?: string } = { content };
	if (imageUrl && imageUrl.trim() !== '') {
		body.image_url = imageUrl.trim();
	}

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Failed to add comment: ${res.status} ${res.statusText} ${text}`);
	}

	const data = await res.json();
	return {
		success: true,
		comment: data.comment ?? data,
		message: data.message,
	};
}
