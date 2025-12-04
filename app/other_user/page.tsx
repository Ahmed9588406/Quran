"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PhotosGrid from "./PhotosGrid";
import PostCard from "./PostCard";
import Leaderboard from "./Leaderboard";
import AboutSection from "./AboutSection";
import { Button } from "@/components/ui/button";

const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });

// Leaderboard data
const leaderboardData = [
	{
		rank: 1,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
		isCurrentUser: true,
	},
	{
		rank: 2,
		name: "Ali Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 263,
	},
	{
		rank: 3,
		name: "Mahmoud Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 262,
	},
	{
		rank: 4,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 261,
	},
	{
		rank: 5,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 255,
	},
	{
		rank: 6,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 7,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 8,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 9,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 10,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 11,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 12,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
	},
	{
		rank: 13,
		name: "Mazen Mohamed",
		avatar: "/icons/settings/profile.png",
		points: 265,
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
	avatar: "/icons/settings/profile.png",
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

const postsData = [
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
			type: "video" as const,
			src: "/figma-assets/prayer-rug.jpg",
			thumbnail: "/figma-assets/prayer-rug.jpg",
		},
	},
];

export default function UserProfilePage() {
	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("posts");
	const [isMessagesOpen, setMessagesOpen] = useState(false);

	// Render content based on active tab
	const renderTabContent = () => {
		switch (activeTab) {
			case "posts":
				return (
					<div className="flex gap-6">
						{/* Left Column - Photos (only on Posts tab) */}
						<div className="w-72 flex-shrink-0 hidden md:block">
							<div className="sticky top-6">
								<PhotosGrid
									photos={photosData}
									onViewAll={() => setActiveTab("photos")}
								/>
							</div>
						</div>
						{/* Right Column - Posts Feed */}
						<div className="flex-1 space-y-4">
							{postsData.map((post) => (
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
						<div className="grid grid-cols-3 gap-2">
							{photosData.map((photo) => (
								<div
									key={photo.id}
									className="relative aspect-square rounded-lg overflow-hidden"
								>
									<img
										src={photo.src}
										alt={photo.alt}
										className="w-full h-full object-cover"
									/>
								</div>
							))}
						</div>
					</div>
				);

			case "reels":
				return (
					<div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
						No reels yet
					</div>
				);

			case "favorites":
				return (
					<div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
						No favorites yet
					</div>
				);

			case "leaderboard":
				return (
					<Leaderboard
						entries={leaderboardData}
						currentUserRank={1}
					/>
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
		<div className="min-h-screen bg-gray-50">
			{/* Top NavBar */}
			<NavBar
				onToggleSidebar={() => setSidebarOpen((s) => !s)}
				isSidebarOpen={isSidebarOpen}
			/>

			{/* Left Sidebar */}
			<LeftSide
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
			<main className="max-w-4xl mx-auto px-6 py-6">
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
