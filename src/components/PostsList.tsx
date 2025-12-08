/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { fetchUserPosts, Post } from '../api/postsApi';

type PostsListProps = {
	// optional: override which user to load posts for
	userId?: string | number;
	initialPage?: number;
	limit?: number;
};

function readSavedAuth() {
	// Try a few common localStorage keys/shapes
	try {
		const raw = localStorage.getItem('currentUser') ?? localStorage.getItem('auth') ?? localStorage.getItem('user');
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		// possible shapes: { id, token } or { user: { id }, token } or { token, userId }
		const id = parsed.id ?? parsed.user?.id ?? parsed.userId;
		const token = parsed.token ?? parsed.accessToken ?? parsed.authToken;
		if (!id && !token) return null;
		return { id, token };
	} catch {
		return null;
	}
}

export const PostsList: React.FC<PostsListProps> = ({ userId: propUserId, initialPage = 1, limit = 20 }) => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [page, setPage] = useState(initialPage);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [total, setTotal] = useState<number | undefined>(undefined);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				let userId = propUserId;
				let token: string | undefined;
				if (!userId) {
					const auth = readSavedAuth();
					if (!auth || !auth.id) {
						throw new Error('No logged-in user found in localStorage. Store { id, token } in currentUser or auth.');
					}
					userId = auth.id;
					token = auth.token;
				} else {
					// still try to read token for Authorization if present
					const auth = readSavedAuth();
					token = auth?.token;
				}

				const resp = await fetchUserPosts(userId!, { limit, page, token });
				if (cancelled) return;
				setPosts(resp.posts);
				if (typeof resp.total === 'number') setTotal(resp.total);
			} catch (err: any) {
				if (cancelled) return;
				setError(err.message ?? String(err));
				setPosts([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [propUserId, page, limit]);

	const canPrev = page > 1;
	const canNext = typeof total === 'number' ? page * limit < total : posts.length === limit;

	return (
		<div>
			<h3>My Posts</h3>
			{loading && <div>Loading posts...</div>}
			{error && <div style={{ color: 'red' }}>Error: {error}</div>}
			{!loading && !error && posts.length === 0 && <div>No posts found.</div>}
			<ul>
				{posts.map((p) => (
					<li key={p.id} style={{ marginBottom: 12 }}>
						{p.title && <strong>{p.title}</strong>}
						{p.createdAt && <div style={{ fontSize: 12, color: '#666' }}>{new Date(p.createdAt).toLocaleString()}</div>}
						{p.body && <div>{p.body}</div>}
					</li>
				))}
			</ul>

			<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
				<button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={!canPrev}>
					Prev
				</button>
				<div>Page {page}</div>
				<button onClick={() => setPage((s) => s + 1)} disabled={!canNext}>
					Next
				</button>
			</div>
		</div>
	);
};

export default PostsList;
