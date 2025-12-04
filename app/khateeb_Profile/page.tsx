"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import ProfileHeader from "./Kh_ProfileHeader";
import ProfileTabs from "./Kh_ProfileTabs";
import PhotosGrid from "./Kh_PhotosGrid";
import PostCard from "./Kh_PostCard";
import KhReels from "./Kh_Reels";
import Leaderboard from "./Kh_Fatwa";
import AboutSection from "./Kh_AboutSection";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Fatwa from "./Kh_Fatwa";
import KhOldLive from "./Kh_old_live";
import CreatePostModal from "./Create_Post";
import Sidebar from "./Sidebar";
const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });

// Fatwa posts (rendered in Fatwa tab)
const fatwaPosts = [
	{
		id: "f1",
		author: { name: "Mazen Mohamed", avatar: "/icons/settings/profile.png" },
		time: "2d",
		content:
			"Pizza ipsum melted black crust tossed olives pineapple wing bbq buffalo meat black mayo mushrooms broccoli personal mayo spinach white mouth stuffed onions hand",
		media: { type: "image" as const, src: "/figma-assets/prayer-rug.jpg" },
		points: 265,
		isCurrentUser: true,
	},
	{
		id: "f2",
		author: { name: "Ali Mohamed", avatar: "/icons/settings/profile.png" },
		time: "3d",
		content:
			"Short fatwa summary explaining a ruling with a supporting image.",
		media: { type: "image" as const, src: "/figma-assets/mosque1.jpg" },
		points: 180,
	},
];

// About data
const workExperiences = [
	{
		id: "w1",
		icon: "/icons/profile/briefcase.svg",
		title: "Add work Experiences",
		isAddNew: true,
	},
	{
		id: "w2",
		icon: "/icons/profile/work.svg",
		title: "UX / UI Designer at Twin Tech IT",
		subtitle: "1 October - Present",
	},
];

const placesLived = [
	{
		id: "pl1",
		icon: "/icons/profile/location.svg",
		title: "Add City",
		isAddNew: true,
	},
	{
		id: "pl2",
		icon: "/icons/profile/location.svg",
		title: "Alexandria , Egypt",
		subtitle: "Current town/city",
	},
];

const contactInfo = [
	{
		id: "c1",
		icon: "/icons/user_profile/info.svg",
		label: "Add Information",
		isAddNew: true,
	},
	{
		id: "c2",
		icon: "/icons/user_profile/phone.svg",
		label: "Phone Number",
		value: "+201212179140",
	},
	{
		id: "c3",
		icon: "/icons/user_profile/email.svg",
		label: "Email Address",
		value: "mazenbeso25@gmail.com",
	},
];

// Sample data
const profileData = {
	name: "Mazen Mohamed",
	avatar: "/icons/Khateb_Profile/Profile-Pic.svg",
	posts: 3,
	followers: 112,
	following: 3100,
	bio: "Lorem ipsum tellus tincidunt pellentesque lacus orci lobortis varius mauris mattis nunc interdum fusce risus quam",
	tags: ["English", "English", "English", "English"],
};

const photosData = [
	{ id: "p1", src: "/figma-assets/mosque1.jpg", alt: "Mosque interior" },
	{ id: "p2", src: "/figma-assets/mosque2.jpg", alt: "Mosque architecture" },
	{ id: "p3", src: "/figma-assets/mosque3.jpg", alt: "Blue Mosque" },
	{ id: "p4", src: "/figma-assets/mosque4.jpg", alt: "Mosque courtyard" },
	{ id: "p5", src: "/figma-assets/mosque5.jpg", alt: "Mosque interior" },
	{ id: "p6", src: "/figma-assets/mosque6.jpg", alt: "Mosque dome" },
	{ id: "p7", src: "/figma-assets/mosque7.jpg", alt: "Prayer hall" },
	{ id: "p8", src: "/figma-assets/mosque8.jpg", alt: "Mosque entrance" },
	{ id: "p9", src: "/figma-assets/mosque9.jpg", alt: "Mosque minaret" },
];

// existing postsData -> move to initialPosts and make stateful below
type Media = { type: "image" | "video"; src: string; thumbnail?: string };
type Post = {
	id: string;
	author: { name: string; avatar: string };
	time: string;
	content: string;
	media?: Media;
};

const initialPostsData: Post[] = [
	{
		id: "post1",
		author: { name: "Mazen Mohamed", avatar: "/icons/settings/profile.png" },
		time: "2d",
		content:
			"Pizza ipsum melted black crust tossed olives pineapple wing bbq buffalo meat black mayo mushrooms broccoli personal mayo spinach white mouth stuffed onions hand",
	},
	{
		id: "post2",
		author: { name: "Mazen Mohamed", avatar: "/icons/settings/profile.png" },
		time: "2d",
		content:
			"Pizza ipsum melted black crust tossed olives pineapple wing bbq buffalo meat black mayo mushrooms broccoli personal mayo spinach white mouth stuffed onions hand",
		media: {
			type: "video",
			src: "/figma-assets/prayer-rug.jpg",
			thumbnail: "/figma-assets/prayer-rug.jpg",
		},
	},
];

// sample reels data (add actual mp4 files to public/figma-assets or update paths)
const reelsData = [
	{
		id: "r1",
		src: "/figma-assets/reel1.mp4",
		thumbnail: "/figma-assets/mosque1.jpg",
		title: "Short prayer explanation",
		author: { name: "Mazen Mohamed", avatar: "/icons/settings/profile.png" },
	},
	{
		id: "r2",
		src: "/figma-assets/reel2.mp4",
		thumbnail: "/figma-assets/mosque2.jpg",
		title: "Charity guidance",
		author: { name: "Ali Mohamed", avatar: "/icons/settings/profile.png" },
	},
	{
		id: "r3",
		src: "/figma-assets/reel3.mp4",
		thumbnail: "/figma-assets/mosque3.jpg",
		title: "Prayer tips",
		author: { name: "Mahmoud Mohamed", avatar: "/icons/settings/profile.png" },
	},
	{
		id: "r4",
		src: "/figma-assets/reel4.mp4",
		thumbnail: "/figma-assets/mosque4.jpg",
		title: "Ramadan reminder",
		author: { name: "Mazen Mohamed", avatar: "/icons/settings/profile.png" },
	},
];

export default function UserProfilePage() {
	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("posts");
	const [isMessagesOpen, setMessagesOpen] = useState(false);

	// posts state (so new posts appear in UI)
	const [posts, setPosts] = useState(initialPostsData);

	// Create post modal visibility
	const [showCreateModal, setShowCreateModal] = useState(false);

	const handleCreateFromModal = (payload: { content: string; media?: Media }) => {
		const newPost: Post = {
			id: `post${Date.now()}`,
			author: { name: profileData.name, avatar: profileData.avatar },
			time: "Now",
			content: payload.content,
			...(payload.media ? { media: payload.media } : {}),
		};
		setPosts((p) => [newPost, ...p]);
	};

	// Render content based on active tab
	const renderTabContent = () => {
		switch (activeTab) {
			case "posts":
				return (
					<div className="flex gap-6">
						{/* Left Column - Photos (only on Posts tab) */}
						<div className="w-80 flex-shrink-0 hidden md:block">
							<div className="sticky top-6">
								<PhotosGrid
									photos={photosData}
									onViewAll={() => setActiveTab("photos")}
								/>
							</div>
						</div>
						{/* Right Column - Posts Feed */}
						<div className="flex-1 space-y-4">
							{/* Create Post Box (opens modal) */}
							<div className="bg-[#FFF9F3] rounded-lg border border-[#f0e6e5] p-4 relative">
								{/* top-right icon button (aligned with the buttons row) */}
								<button
									aria-label="Quick action"
									className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white"
									onClick={(e) => {
										e.stopPropagation();
										// add your handler here
									}}
								>
									<Image
										src="/icons/Khateb_Profile/more.svg"
										alt="more"
										width={20}
										height={20}
									/>
								</button>

								<div
									className="flex items-start gap-3 cursor-text"
									onClick={() => setShowCreateModal(true)}
								>
									<div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 transform -translate-y-2">
										<Image
											src={profileData.avatar}
											alt={profileData.name}
											fill
											style={{ objectFit: "cover" }}
										/>
									</div>
									<div className="flex-1">
										<div className="w-full h-10 rounded-full border border-transparent bg-[#fffaf7] text-xs text-[#B3B3B3] flex items-center px-4">
											<span>Write here...</span>
										</div>
										<div className="mt-3 flex items-center gap-2">
											<button
												className="h-10 px-4 bg-[#EFDEBC] text-[#7b2030] rounded-2xl flex items-center gap-2"
												onClick={(e) => {
													e.stopPropagation();
													// handle add media
												}}
											>
												<Image
													src="/icons/Khateb_Profile/add_media.svg"
													alt="add"
													width={20}
													height={20}
												/>
												<span className="text-sm">Add media</span>
											</button>
											<button
												className="h-10 px-4 bg-[#EFDEBC] text-[#7b2030] rounded-2xl flex items-center gap-2"
												onClick={(e) => {
													e.stopPropagation();
													// handle start live
												}}
											>
												<Image
													src="/icons/Khateb_Profile/live.svg"
													alt="live"
													width={20}
													height={20}
												/>
												<span className="text-sm">Start Live</span>
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* Create Post Modal */}
							<CreatePostModal
								isOpen={showCreateModal}
								onClose={() => setShowCreateModal(false)}
								onCreate={handleCreateFromModal}
								authorName={profileData.name}
								authorAvatar={profileData.avatar}
							/>

							{posts.map((post) => (
								<PostCard
									key={post.id}
									id={post.id}
									author={post.author}
									time={post.time}
									content={post.content}
									media={post.media}
								/>
							))}
						</div>
					</div>
				);

			case "photos":
				return (
					<div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
						<h2 className="text-lg font-semibold mb-4">All Photos</h2>
						<div className="grid grid-cols-5 gap-2">
							{photosData.map((photo) => (
								<div
									key={photo.id}
									className="relative aspect-square rounded-lg overflow-hidden"
								>
									<Image
										src={photo.src}
										alt={photo.alt}
										className="w-full h-full object-cover"
										width={30}
										height={30}
									/>
								</div>
							))}
						</div>
					</div>
				);

			case "reels":
				return <KhReels reels={reelsData} />;

			case "old Live":
				return <KhOldLive />;

			case "favorites":
				return (
					<div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
						No favorites yet
					</div>
				);

			case "fatwa":
				return (
					<Fatwa entries={fatwaPosts} />
				);

			case "about":
				return (
					<AboutSection
						workExperiences={workExperiences}
						placesLived={placesLived}
						contactInfo={contactInfo}
						isOwnProfile={true}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 mt-10">
			{/* Top NavBar */}
			<NavBar
				onToggleSidebar={() => setSidebarOpen((s) => !s)}
				isSidebarOpen={isSidebarOpen}
			/>

			{/* Left Sidebar */}
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeView="profile"
			/>

			{/* Profile Header */}
			<ProfileHeader
				name={profileData.name}
				avatar={profileData.avatar}
				posts={profileData.posts}
				followers={profileData.followers}
				following={profileData.following}
				bio={profileData.bio}
				tags={profileData.tags}
				isOwnProfile={true}
			/>

			{/* Tabs */}
			<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Main Content - Only active tab content */}
			<main className="max-w-6xl mx-auto px-4 py-6">
				{renderTabContent()}
			</main>

			{/* Floating Messages Button */}
			<div className="fixed right-8 bottom-8 z-50">
				<Button
					aria-label="Open messages"
					className="h-[48px] bg-[#7b2030] text-white rounded-2xl inline-flex items-center justify-center gap-2 px-5 py-2 shadow-lg hover:bg-[#5e0e27]"
					type="button"
					onClick={() => setMessagesOpen(true)}
				>
					<span className="text-sm font-medium">Messages</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden
						className="opacity-90"
					>
						<path
							d="M18 15l-6-6-6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Button>
			</div>

			{/* Messages Modal */}
			{isMessagesOpen && (
				<MessagesModal
					isOpen={true}
					onClose={() => setMessagesOpen(false)}
					onOpenStart={() => setMessagesOpen(false)}
				/>
			)}
		</div>
	);
}