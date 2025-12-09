/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { fetchFeed, FeedPost } from "../../src/feed/feedApi";
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Send, ThumbsUp, X } from "lucide-react";
import { likeComment, unlikeComment, addComment, addReply } from "@/src/api/postsApi";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

type FeedProps = {
	initialPage?: number;
	perPage?: number;
};

/**
 * Avatar component with fallback handling
 */
function Avatar({ src, alt, size = 32 }: { src?: string; alt: string; size?: number }) {
	const [imgError, setImgError] = useState(false);
	const avatarSrc = imgError || !src ? DEFAULT_AVATAR : src;

	return (
		<div
			className="rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
			style={{ width: size, height: size }}
		>
			<img
				src={avatarSrc}
				alt={alt}
				className="w-full h-full object-cover"
				onError={() => setImgError(true)}
			/>
		</div>
	);
}

/**
 * Comment reply interface
 */
interface CommentReply {
	id: string;
	author: {
		name: string;
		avatar: string;
		username: string;
	};
	content: string;
	created_at: string;
	likes_count: number;
	liked_by_current_user: boolean;
}

/**
 * Comment interface
 */
interface Comment {
	id: string;
	author: {
		name: string;
		avatar: string;
		username: string;
	};
	content: string;
	created_at: string;
	likes_count: number;
	liked_by_current_user: boolean;
	replies: CommentReply[];
	replies_count?: number;
}

/**
 * Media interface
 */
interface Media {
	url: string;
	media_type: string;
}

/**
 * Format relative time from date string
 */
function formatRelativeTime(dateString?: string): string {
	if (!dateString) return "";
	const date = new Date(dateString);
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
}

// Helper to normalize avatar URLs
const normalizeAvatarUrl = (url?: string): string => {
	if (!url) return DEFAULT_AVATAR;
	if (url.startsWith("http")) return url;
	return `http://192.168.1.18:9001${url}`;
};

// Helper to normalize media URLs
const normalizeMediaUrl = (url?: string): string => {
	if (!url) return "";
	if (url.startsWith("http")) return url;
	return `http://192.168.1.18:9001${url}`;
};

/**
 * Single Comment Component with reply fetching
 */
interface CommentItemProps {
	comment: Comment;
	postId: string;
	currentUserAvatar: string;
	currentUserName: string;
	onLikeComment: (commentId: string) => void;
	onReplyToComment: (commentId: string, content: string) => void;
}

function CommentItem({ comment, postId, currentUserAvatar, currentUserName, onLikeComment, onReplyToComment }: CommentItemProps) {
	const [showReplyInput, setShowReplyInput] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [showReplies, setShowReplies] = useState(false);
	const [replies, setReplies] = useState<CommentReply[]>(comment.replies || []);
	const [isLoadingReplies, setIsLoadingReplies] = useState(false);
	const [repliesFetched, setRepliesFetched] = useState(false);

	const handleSubmitReply = async () => {
		if (replyContent.trim()) {
			const tempId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const newReply: CommentReply = {
				id: tempId,
				author: {
					name: currentUserName,
					avatar: currentUserAvatar,
					username: "current_user",
				},
				content: replyContent.trim(),
				created_at: new Date().toISOString(),
				likes_count: 0,
				liked_by_current_user: false,
			};
			setReplies((prev) => [...prev, newReply]);

			const replyText = replyContent.trim();
			setReplyContent("");
			setShowReplyInput(false);
			setShowReplies(true);

			try {
				const token = localStorage.getItem("access_token") || undefined;
				const result = await addReply(postId, comment.id, replyText, token);

				if (result.success && result.reply) {
					setReplies((prev) =>
						prev.map((r) =>
							r.id === tempId
								? {
										...r,
										id: result.reply!.id,
										created_at: result.reply!.created_at || r.created_at,
								  }
								: r
						)
					);
				}
			} catch (err) {
				console.error("Error posting reply:", err);
				setReplies((prev) => prev.filter((r) => r.id !== tempId));
			}

			onReplyToComment(comment.id, replyText);
		}
	};

	const fetchReplies = async () => {
		if (repliesFetched || isLoadingReplies) return;

		setIsLoadingReplies(true);
		try {
			const token = localStorage.getItem("access_token");
			if (!token) {
				setIsLoadingReplies(false);
				return;
			}

			const res = await fetch(`/api/comments/${comment.id}/replies`, {
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) {
				console.error("Failed to fetch replies:", res.status);
				setReplies([]);
				return;
			}

			const data = await res.json();
			const repliesArray = data?.replies || (Array.isArray(data) ? data : []);

			const fetchedReplies: CommentReply[] = repliesArray.map((r: any) => ({
				id: r.id,
				author: {
					name: r.author?.display_name || r.author?.username || r.display_name || r.username || "User",
					avatar: normalizeAvatarUrl(r.author?.avatar_url || r.author?.avatar || r.avatar_url || r.avatar),
					username: r.author?.username || r.username || "",
				},
				content: r.content || r.text || "",
				created_at: r.created_at,
				likes_count: r.likes_count || 0,
				liked_by_current_user: r.liked_by_current_user || false,
			}));

			setReplies(fetchedReplies);
			setRepliesFetched(true);
		} catch (err) {
			console.error("Error fetching replies:", err);
		} finally {
			setIsLoadingReplies(false);
		}
	};

	const handleToggleReplies = async () => {
		if (!showReplies && !repliesFetched && (comment.replies_count || 0) > 0) {
			await fetchReplies();
		}
		setShowReplies(!showReplies);
	};

	const repliesCount = comment.replies_count || replies.length;

	return (
		<div className="flex gap-3">
			<Avatar src={comment.author.avatar} alt={comment.author.name} size={32} />
			<div className="flex-1">
				<div className="bg-gray-100 rounded-xl px-3 py-2">
					<span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
					<p className="text-sm text-gray-700">{comment.content}</p>
				</div>
				<div className="flex items-center gap-4 mt-1 px-2">
					<span className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</span>
					<button
						onClick={() => onLikeComment(comment.id)}
						className={`text-xs font-medium ${comment.liked_by_current_user ? "text-[#7b2030]" : "text-gray-500 hover:text-gray-700"}`}
					>
						Like {comment.likes_count > 0 && `(${comment.likes_count})`}
					</button>
					<button
						onClick={() => setShowReplyInput(!showReplyInput)}
						className="text-xs font-medium text-gray-500 hover:text-gray-700"
					>
						Reply
					</button>
				</div>

				{showReplyInput && (
					<div className="flex items-center gap-2 mt-2 pl-2">
						<Avatar src={currentUserAvatar} alt="Your avatar" size={24} />
						<input
							type="text"
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							placeholder={`Reply to ${comment.author.name}...`}
							className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#7b2030]"
							onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
						/>
						<button
							onClick={handleSubmitReply}
							disabled={!replyContent.trim()}
							className="p-1.5 text-[#7b2030] hover:bg-gray-100 rounded-full disabled:opacity-50"
						>
							<Send className="w-4 h-4" />
						</button>
					</div>
				)}

				{repliesCount > 0 && (
					<div className="mt-2 pl-2">
						{!showReplies ? (
							<button
								onClick={handleToggleReplies}
								className="text-xs text-[#7b2030] font-medium hover:underline"
							>
								View {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
							</button>
						) : (
							<div className="space-y-3">
								{isLoadingReplies ? (
									<div className="text-xs text-gray-500">Loading replies...</div>
								) : (
									<>
										{replies.map((reply, index) => (
											<div key={reply.id || `reply-${index}`} className="flex gap-2">
												<Avatar src={reply.author.avatar} alt={reply.author.name} size={24} />
												<div className="flex-1">
													<div className="bg-gray-100 rounded-xl px-3 py-1.5">
														<span className="text-xs font-semibold text-gray-900">{reply.author.name}</span>
														<p className="text-xs text-gray-700">{reply.content}</p>
													</div>
													<div className="flex items-center gap-3 mt-0.5 px-2">
														<span className="text-xs text-gray-500">{formatRelativeTime(reply.created_at)}</span>
														<button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
													</div>
												</div>
											</div>
										))}
										<button
											onClick={() => setShowReplies(false)}
											className="text-xs text-gray-500 hover:underline"
										>
											Hide replies
										</button>
									</>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Facebook-style Media Grid Component
 */
interface MediaGridProps {
	media: Media[];
	onImageClick: (index: number) => void;
}

function MediaGrid({ media, onImageClick }: MediaGridProps) {
	const imageMedia = media.filter((m) => !m.media_type?.includes("video"));
	const videoMedia = media.filter((m) => m.media_type?.includes("video"));
	const totalImages = imageMedia.length;

	const renderVideos = () => (
		<>
			{videoMedia.map((item, index) => {
				const mediaUrl = normalizeMediaUrl(item.url);
				return (
					<div key={`video-${index}`} className="relative aspect-video bg-black">
						<video src={mediaUrl} className="w-full h-full object-cover" controls preload="metadata" />
					</div>
				);
			})}
		</>
	);

	if (totalImages === 1) {
		const mediaUrl = normalizeMediaUrl(imageMedia[0].url);
		return (
			<div className="mt-3">
				{renderVideos()}
				<div className="relative w-full cursor-pointer" onClick={() => onImageClick(0)}>
					<img
						src={mediaUrl}
						alt="Post media"
						className="w-full h-auto object-cover max-h-[500px]"
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = "none";
						}}
					/>
				</div>
			</div>
		);
	}

	if (totalImages === 2) {
		return (
			<div className="mt-3">
				{renderVideos()}
				<div className="grid grid-cols-2 gap-1">
					{imageMedia.map((item, index) => {
						const mediaUrl = normalizeMediaUrl(item.url);
						return (
							<div
								key={index}
								className="relative aspect-square cursor-pointer overflow-hidden"
								onClick={() => onImageClick(index)}
							>
								<img
									src={mediaUrl}
									alt={`Post media ${index + 1}`}
									className="w-full h-full object-cover hover:scale-105 transition-transform"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.style.display = "none";
									}}
								/>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	if (totalImages === 3) {
		return (
			<div className="mt-3">
				{renderVideos()}
				<div className="grid grid-cols-2 gap-1" style={{ height: "400px" }}>
					<div
						className="relative cursor-pointer overflow-hidden row-span-2"
						onClick={() => onImageClick(0)}
					>
						<img
							src={normalizeMediaUrl(imageMedia[0].url)}
							alt="Post media 1"
							className="w-full h-full object-cover hover:scale-105 transition-transform"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
							}}
						/>
					</div>
					<div className="grid grid-rows-2 gap-1">
						{imageMedia.slice(1, 3).map((item, index) => {
							const mediaUrl = normalizeMediaUrl(item.url);
							return (
								<div
									key={index}
									className="relative cursor-pointer overflow-hidden"
									onClick={() => onImageClick(index + 1)}
								>
									<img
										src={mediaUrl}
										alt={`Post media ${index + 2}`}
										className="w-full h-full object-cover hover:scale-105 transition-transform"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	if (totalImages === 4) {
		return (
			<div className="mt-3">
				{renderVideos()}
				<div className="grid grid-cols-2 gap-1">
					{imageMedia.map((item, index) => {
						const mediaUrl = normalizeMediaUrl(item.url);
						return (
							<div
								key={index}
								className="relative aspect-square cursor-pointer overflow-hidden"
								onClick={() => onImageClick(index)}
							>
								<img
									src={mediaUrl}
									alt={`Post media ${index + 1}`}
									className="w-full h-full object-cover hover:scale-105 transition-transform"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.style.display = "none";
									}}
								/>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	const remainingCount = totalImages - 4;
	return (
		<div className="mt-3">
			{renderVideos()}
			<div className="grid grid-cols-2 gap-1">
				{imageMedia.slice(0, 4).map((item, index) => {
					const mediaUrl = normalizeMediaUrl(item.url);
					const isLastVisible = index === 3 && remainingCount > 0;
					return (
						<div
							key={index}
							className="relative aspect-square cursor-pointer overflow-hidden"
							onClick={() => onImageClick(index)}
						>
							<img
								src={mediaUrl}
								alt={`Post media ${index + 1}`}
								className="w-full h-full object-cover hover:scale-105 transition-transform"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
								}}
							/>
							{isLastVisible && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<span className="text-white text-2xl font-bold">+{remainingCount}</span>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

/**
 * Image Lightbox Component
 */
interface LightboxProps {
	media: Media[];
	currentIndex: number;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
}

function Lightbox({ media, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
	const currentMedia = media[currentIndex];
	const mediaUrl = normalizeMediaUrl(currentMedia?.url);

	return (
		<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
			<button
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full z-10"
			>
				<X className="w-6 h-6" />
			</button>

			{currentIndex > 0 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onPrev();
					}}
					className="absolute left-4 text-white p-3 hover:bg-white/20 rounded-full text-3xl"
				>
					‹
				</button>
			)}

			<div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
				<img src={mediaUrl} alt={`Image ${currentIndex + 1}`} className="max-w-full max-h-[90vh] object-contain" />
			</div>

			{currentIndex < media.length - 1 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onNext();
					}}
					className="absolute right-4 text-white p-3 hover:bg-white/20 rounded-full text-3xl"
				>
					›
				</button>
			)}

			<div className="absolute bottom-4 text-white text-sm">
				{currentIndex + 1} / {media.length}
			</div>
		</div>
	);
}

/**
 * Single Post Card Component - Matches PostCard.tsx exactly
 */
interface FeedPostCardProps {
	post: FeedPost;
	currentUserAvatar: string;
	currentUserName: string;
}

function FeedPostCard({ post, currentUserAvatar, currentUserName }: FeedPostCardProps) {
	const [liked, setLiked] = useState(post.liked_by_me ?? false);
	const [likeCount, setLikeCount] = useState(post.likes_count ?? 0);
	const [showComments, setShowComments] = useState(false);
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
	// follow state (post.is_following can be 0/1 or boolean)
	const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(post.is_following));
	const [isTogglingFollow, setIsTogglingFollow] = useState(false);

	const authorName = post.display_name || post.username || "User";
	const authorAvatar = post.avatar_url || DEFAULT_AVATAR;
	const timeAgo = formatRelativeTime(post.created_at);
	const imageMedia = post.media?.filter((m) => !m.media_type?.includes("video")) || [];

	const handleLike = () => {
		setLiked(!liked);
		setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
	};

	const handleToggleComments = async () => {
		setShowComments(!showComments);
		if (!showComments && comments.length === 0) {
			await fetchComments();
		}
	};

	const fetchComments = async () => {
		setIsLoadingComments(true);
		try {
			const token = localStorage.getItem("access_token");
			if (!token) {
				setIsLoadingComments(false);
				return;
			}

			const res = await fetch(`/api/posts/${post.id}/comments?limit=10`, {
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) {
				console.error("Failed to fetch comments:", res.status);
				setComments([]);
				return;
			}

			const data = await res.json();
			const commentsArray = data?.comments || (Array.isArray(data) ? data : []);

			const fetchedComments: Comment[] = commentsArray.map((c: any) => ({
				id: c.id,
				author: {
					name: c.author?.display_name || c.author?.username || c.display_name || c.username || "User",
					avatar: normalizeAvatarUrl(c.author?.avatar_url || c.author?.avatar || c.avatar_url || c.avatar),
					username: c.author?.username || c.username || "",
				},
				content: c.content || c.text || "",
				created_at: c.created_at,
				likes_count: c.likes_count || 0,
				liked_by_current_user: c.liked_by_current_user || false,
				replies_count: c.replies_count || 0,
				replies: (c.replies || []).map((r: any) => ({
					id: r.id,
					author: {
						name: r.author?.display_name || r.author?.username || r.display_name || r.username || "User",
						avatar: normalizeAvatarUrl(r.author?.avatar_url || r.author?.avatar || r.avatar_url || r.avatar),
						username: r.author?.username || r.username || "",
					},
					content: r.content || r.text || "",
					created_at: r.created_at,
					likes_count: r.likes_count || 0,
					liked_by_current_user: r.liked_by_current_user || false,
				})),
			}));

			setComments(fetchedComments);
		} catch (err) {
			console.error("Error fetching comments:", err);
			setComments([]);
		} finally {
			setIsLoadingComments(false);
		}
	};

	const handleSubmitComment = async () => {
		if (commentText.trim()) {
			const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const newComment: Comment = {
				id: tempId,
				author: {
					name: currentUserName,
					avatar: currentUserAvatar,
					username: "current_user",
				},
				content: commentText.trim(),
				created_at: new Date().toISOString(),
				likes_count: 0,
				liked_by_current_user: false,
				replies: [],
				replies_count: 0,
			};
			setComments((prev) => [newComment, ...prev]);

			const commentContent = commentText.trim();
			setCommentText("");

			try {
				const token = localStorage.getItem("access_token") || undefined;
				const result = await addComment(post.id, commentContent, undefined, token);

				if (result.success && result.comment) {
					setComments((prev) =>
						prev.map((c) =>
							c.id === tempId
								? {
										...c,
										id: result.comment!.id,
										created_at: result.comment!.created_at || c.created_at,
								  }
								: c
						)
					);
				}
			} catch (err) {
				console.error("Error posting comment:", err);
				setComments((prev) => prev.filter((c) => c.id !== tempId));
			}
		}
	};

	const handleLikeComment = async (commentId: string) => {
		const comment = comments.find((c) => c.id === commentId);
		const isCurrentlyLiked = comment?.liked_by_current_user ?? false;

		setComments((prev) =>
			prev.map((c) =>
				c.id === commentId
					? {
							...c,
							liked_by_current_user: !c.liked_by_current_user,
							likes_count: c.liked_by_current_user ? c.likes_count - 1 : c.likes_count + 1,
					  }
					: c
			)
		);

		try {
			const token = localStorage.getItem("access_token") || undefined;
			const result = isCurrentlyLiked ? await unlikeComment(commentId, token) : await likeComment(commentId, token);

			if (result.likesCount !== undefined) {
				setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, likes_count: result.likesCount! } : c)));
			}
		} catch (error) {
			console.error("Failed to like/unlike comment:", error);
			setComments((prev) =>
				prev.map((c) =>
					c.id === commentId
						? {
								...c,
								liked_by_current_user: isCurrentlyLiked,
								likes_count: isCurrentlyLiked ? c.likes_count + 1 : c.likes_count - 1,
						  }
						: c
				)
			);
		}
	};

	const handleReplyToComment = (commentId: string, replyContent: string) => {
		const newReply: CommentReply = {
			id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			author: {
				name: currentUserName,
				avatar: currentUserAvatar,
				username: "current_user",
			},
			content: replyContent,
			created_at: new Date().toISOString(),
			likes_count: 0,
			liked_by_current_user: false,
		};
		setComments((prev) =>
			prev.map((c) =>
				c.id === commentId
					? {
							...c,
							replies: [...(c.replies || []), newReply],
							replies_count: (c.replies_count || 0) + 1,
					  }
					: c
			)
		);
	};

	const handleImageClick = (index: number) => {
		setLightboxIndex(index);
	};

	async function toggleFollow() {
		// author id is expected on post.author_id; guard if missing
		const authorId = (post as any).author_id || (post as any).authorId || undefined;
		if (!authorId) return;
		const prev = isFollowing;
		setIsFollowing(!prev);
		setIsTogglingFollow(true);
		try {
			const token = localStorage.getItem("access_token") ?? undefined;
			// attempt to call a local proxy endpoint that handles follow/unfollow.
			// POST -> follow, DELETE -> unfollow. If your API differs, adjust the path/method.
			const res = await fetch("/api/follow", {
				method: prev ? "DELETE" : "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ userId: String(authorId) }),
			});
			if (!res.ok) {
				// revert on failure
				setIsFollowing(prev);
			}
		} catch (err) {
			console.error("Follow toggle failed", err);
			setIsFollowing(prev);
		} finally {
			setIsTogglingFollow(false);
		}
	}

	// Suppress unused variable warnings
	void likeCount;

	return (
		<>
			<div className="bg-white rounded-lg border border-[#f0e6e5] overflow-hidden">
				{/* Header */}
				<div className="flex items-start justify-between p-4 pb-0">
					<div className="flex items-center gap-3">
						<Avatar src={authorAvatar} alt={authorName} size={40} />
						<div>
							<h3 className="text-sm font-semibold text-gray-900">{authorName}</h3>
							<p className="text-xs text-gray-500">{timeAgo}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* Follow / Following button */}
						<button
							onClick={toggleFollow}
							disabled={isTogglingFollow}
							className={`px-4 py-1 text-xs font-medium rounded-full transition-colors ${
								isFollowing
									? "bg-white text-[#7b2030] border border-[#7b2030] hover:bg-[#fffaf9]"
									: "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
							}`}
						>
							{isTogglingFollow ? "..." : isFollowing ? "Following" : "Follow"}
						</button>
						<button aria-label="More options" className="p-1 text-gray-400 hover:text-gray-600">
							<MoreHorizontal className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				{post.content && <p className="px-4 mt-3 text-sm text-gray-700 leading-relaxed">{post.content}</p>}

				{/* Media Grid */}
				{post.media && post.media.length > 0 && <MediaGrid media={post.media} onImageClick={handleImageClick} />}

				{/* Actions */}
				<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-3">
					<button
						onClick={handleLike}
						className={`flex items-center gap-2 text-sm ${liked ? "text-[#7b2030]" : "text-gray-500 hover:text-gray-700"}`}
					>
						<ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
						<span>Like</span>
					</button>

					<button onClick={handleToggleComments} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
						<MessageCircle className="w-5 h-5" />
						<span>Comment</span>
					</button>

					<button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
						<Repeat2 className="w-5 h-5" />
						<span>Repost</span>
					</button>

					<button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
						<Share2 className="w-5 h-5" />
						<span>Share</span>
					</button>
				</div>

				{/* Comments Section */}
				{showComments && (
					<div className="px-4 pb-4 border-t border-gray-100">
						{/* Comment Input */}
						<div className="flex items-center gap-3 py-3">
							<Avatar src={currentUserAvatar} alt="Your avatar" size={32} />
							<div className="flex-1 flex items-center gap-2">
								<input
									type="text"
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									placeholder="Write a comment..."
									className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#7b2030]"
									onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
								/>
								<button
									onClick={handleSubmitComment}
									disabled={!commentText.trim()}
									className="p-2 text-[#7b2030] hover:bg-gray-100 rounded-full disabled:opacity-50"
								>
									<Send className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Comments List */}
						{isLoadingComments ? (
							<div className="text-center text-gray-500 text-sm py-4">Loading comments...</div>
						) : comments.length === 0 ? (
							<div className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</div>
						) : (
							<div className="space-y-4">
								{comments.map((comment, index) => (
									<CommentItem
										key={comment.id || `comment-${index}`}
										comment={comment}
										postId={post.id}
										currentUserAvatar={currentUserAvatar}
										currentUserName={currentUserName}
										onLikeComment={handleLikeComment}
										onReplyToComment={handleReplyToComment}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Lightbox */}
			{lightboxIndex !== null && imageMedia.length > 0 && (
				<Lightbox
					media={imageMedia}
					currentIndex={lightboxIndex}
					onClose={() => setLightboxIndex(null)}
					onPrev={() => setLightboxIndex((prev) => Math.max(0, (prev || 0) - 1))}
					onNext={() => setLightboxIndex((prev) => Math.min(imageMedia.length - 1, (prev || 0) + 1))}
				/>
			)}
		</>
	);
}

/**
 * Main Feed Component
 */
export default function Feed({ initialPage = 1, perPage = 10 }: FeedProps) {
	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [page, setPage] = useState(initialPage);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [currentUserAvatar, setCurrentUserAvatar] = useState(DEFAULT_AVATAR);
	const [currentUserName, setCurrentUserName] = useState("You");

	useEffect(() => {
		// Get current user info from localStorage
		try {
			const userStr = localStorage.getItem("user");
			if (userStr) {
				const user = JSON.parse(userStr);
				setCurrentUserAvatar(normalizeAvatarUrl(user.avatar_url) || DEFAULT_AVATAR);
				setCurrentUserName(user.display_name || user.username || "You");
			}
		} catch (err) {
			console.error("Error reading user from localStorage:", err);
		}
	}, []);

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

	return (
		<div className="w-full">
			{loading && <div className="text-sm text-gray-600 text-center py-4">Loading feed...</div>}
			{error && <div className="text-sm text-red-500 text-center py-4">Error: {error}</div>}
			{!loading && !error && posts.length === 0 && <div className="text-sm text-gray-600 text-center py-4">No posts yet.</div>}

			<div className="flex flex-col gap-6">
				{posts.map((post) => (
					<FeedPostCard key={post.id} post={post} currentUserAvatar={currentUserAvatar} currentUserName={currentUserName} />
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
