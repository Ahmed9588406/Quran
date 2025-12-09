"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchFeed, FeedPost } from "../../src/feed/feedApi";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";

type FeedProps = {
	initialPage?: number;
	perPage?: number;
};

function formatDate(d?: string) {
	if (!d) return "";
	try {
		const date = new Date(d);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m`;
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		return date.toLocaleDateString();
	} catch {
		return d;
	}
}

export default function Feed({ initialPage = 1, perPage = 10 }: FeedProps) {
	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [page, setPage] = useState(initialPage);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

	useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const token = typeof window !== "undefined" ? localStorage.getItem("access_token") ?? undefined : undefined;
				const resp = await fetchFeed(page, perPage, token);
				if (cancelled) return;
				setPosts(resp.posts ?? []);
				// Initialize liked state from API
				const likedState: Record<string, boolean> = {};
				(resp.posts ?? []).forEach((p) => {
					likedState[p.id] = p.liked_by_me ?? false;
				});
				setLikedPosts(likedState);
				setHasMore((resp.posts?.length ?? 0) >= perPage);
			} catch (err: unknown) {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : String(err));
				setPosts([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [page, perPage]);

	const toggleLike = (postId: string) => {
		setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
	};

	return (
		<div className="w-full">
			{loading && <div className="text-sm text-gray-600 text-center py-4">Loading feed...</div>}
			{error && <div className="text-sm text-red-500 text-center py-4">Error: {error}</div>}
			{!loading && !error && posts.length === 0 && (
				<div className="text-sm text-gray-600 text-center py-4">No posts yet.</div>
			)}

			<div className="flex flex-col gap-6">
				{posts.map((p) => (
					<article
						key={p.id}
						className="bg-[#fff6f3] rounded-xl shadow-md border border-[#f0e6e5] overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center gap-3 px-4 py-3">
							<div className="w-11 h-11 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
								{p.avatar_url ? (
									<Image
										src={p.avatar_url}
										alt={p.display_name ?? p.username ?? "avatar"}
										fill
										style={{ objectFit: "cover" }}
										unoptimized
									/>
								) : (
									<Image
										src="/icons/settings/profile.png"
										alt="avatar"
										fill
										style={{ objectFit: "cover" }}
									/>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="font-semibold text-sm text-gray-900 truncate">
										{p.display_name ?? p.username}
									</span>
									<span className="text-xs text-gray-400">· {formatDate(p.created_at)}</span>
								</div>
							</div>
							{p.is_following === 0 && (
								<button className="bg-[#7b2030] text-white text-sm px-3 py-1 rounded-md font-medium hover:opacity-95">
									Follow
								</button>
							)}
						</div>

						{/* Content */}
						{p.content && (
							<div className="px-4 pb-3">
								<p className="text-sm text-gray-800 leading-relaxed">{p.content}</p>
							</div>
						)}

						{/* Media */}
						{p.media && p.media.length > 0 && (
							<div className="px-4 pb-4">
								<div className="grid gap-2">
									{p.media.map((m, idx) =>
										(m.media_type || "").includes("video") ? (
											<video
												key={idx}
												src={m.url}
												controls
												className="w-full max-h-[480px] rounded-lg bg-black"
											/>
										) : (
											<div key={idx} className="relative w-full h-64 rounded-lg overflow-hidden">
												<Image
													src={m.url}
													alt={`media-${idx}`}
													fill
													className="object-cover"
													unoptimized
												/>
											</div>
										)
									)}
								</div>
							</div>
						)}

						{/* Actions */}
						<div className="px-4 pb-4">
							<div className="flex items-center justify-between">
								<div className="flex gap-6">
									<button
										onClick={() => toggleLike(p.id)}
										className="flex flex-col items-center text-center focus:outline-none"
									>
										<Heart
											className={`w-5 h-5 ${
												likedPosts[p.id] ? "text-red-500 fill-red-500" : "text-gray-500"
											}`}
										/>
										<span className="text-xs mt-1 text-gray-600">
											{(p.likes_count ?? 0) + (likedPosts[p.id] && !p.liked_by_me ? 1 : 0) - (!likedPosts[p.id] && p.liked_by_me ? 1 : 0)}
										</span>
									</button>

									<button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
										<MessageCircle className="w-5 h-5 text-gray-500" />
										<span className="text-xs mt-1">{p.comments_count ?? 0}</span>
									</button>

									<button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
										<Repeat2 className="w-5 h-5 text-gray-500" />
										<span className="text-xs mt-1">{p.shares_count ?? 0}</span>
									</button>

									<button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
										<Share2 className="w-5 h-5 text-gray-500" />
										<span className="text-xs mt-1">Share</span>
									</button>
								</div>
							</div>
						</div>
					</article>
				))}
			</div>

			{/* Pagination */}
			{posts.length > 0 && (
				<div className="mt-6 flex items-center justify-center gap-4">
					<button
						onClick={() => setPage((s) => Math.max(1, s - 1))}
						disabled={page <= 1 || loading}
						className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
					>
						Previous
					</button>
					<span className="text-sm text-gray-600">Page {page}</span>
					<button
						onClick={() => setPage((s) => s + 1)}
						disabled={!hasMore || loading}
						className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
