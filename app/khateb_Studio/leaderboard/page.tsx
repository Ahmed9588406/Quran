"use client";
import React, { useState } from "react";
import KhatebNavbar from "../KhatebNavbar";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import dynamic from "next/dynamic";

const StartNewMessage = dynamic(() => import("../../user/start_new_message"), { ssr: false });

type User = { id: string; name: string; avatar: string };

// Sample users for Start New Message
const sampleUsers: User[] = [
  { id: "u1", name: "Ahmed Abdullah", avatar: "https://i.pravatar.cc/80?img=1" },
  { id: "u2", name: "Mohammed Ali", avatar: "https://i.pravatar.cc/80?img=2" },
  { id: "u3", name: "Fatima Hassan", avatar: "https://i.pravatar.cc/80?img=3" },
];

// Leaderboard data matching the image
const leaderboardData = [
  { rank: 1, name: "Omar Magdy", avatar: "https://i.pravatar.cc/80?img=11", totalPoints: 2785, accuracy: 97 },
  { rank: 2, name: "Talin Mostafa", avatar: "https://i.pravatar.cc/80?img=12", totalPoints: 2462, accuracy: 94 },
  { rank: 3, name: "Amr Hassan", avatar: "https://i.pravatar.cc/80?img=13", totalPoints: 2238, accuracy: 92 },
  { rank: 4, name: "Mohamed Nazer", avatar: "https://i.pravatar.cc/80?img=14", totalPoints: 1789, accuracy: 85 },
  { rank: 5, name: "Zain Rashad", avatar: "https://i.pravatar.cc/80?img=15", totalPoints: 1720, accuracy: 83 },
  { rank: 9, name: "Alaa Essam", avatar: "https://i.pravatar.cc/80?img=16", totalPoints: 1630, accuracy: 80, isCurrentUser: true },
];

// Top 3 Podium Component - matching the exact image layout
function TopThreePodium() {
  const first = leaderboardData.find(u => u.rank === 1);
  const second = leaderboardData.find(u => u.rank === 2);
  const third = leaderboardData.find(u => u.rank === 3);

  return (
    <div className="flex items-end justify-center gap-12 mb-12 mt-4 px-4">
      {/* 2nd Place - Left */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="w-[85px] h-[85px] rounded-full overflow-hidden border-[3px] border-[#D4B896] bg-gray-100">
            <img
              src={second?.avatar}
              alt={second?.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Rank badge - top left */}
          <img
            src="/icons/Leaderboard/2nd.svg"
            height={35}
            width={35}
            className="absolute -top-1 -left-1"
          />
        </div>
        <span className="text-[13px] font-medium text-gray-800 mb-2">{second?.name}</span>
        <div className="flex items-center gap-6 text-[11px] text-gray-500">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full bg-[#C9A96F]"></span>
              <span className="font-medium text-gray-700">{second?.accuracy}%</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Accuracy</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 text-xs">⚡</span>
              <span className="font-medium text-gray-700">{second?.totalPoints.toLocaleString()}</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Total Points</span>
          </div>
        </div>
      </div>

      {/* 1st Place - Center (Elevated) */}
      <div className="flex flex-col items-center -mt-6">
        <div className="relative mb-2">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[3px] border-[#D4AF37] bg-gray-100">
            <img
              src={first?.avatar}
              alt={first?.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Crown/1st badge - top center */}
          <img
            src="/icons/Leaderboard/1st.svg"
            height={40}
            width={40}
            className="absolute -top-3 left-1/2 -translate-x-1/2"
          />
        </div>
        <span className="text-[14px] font-semibold text-gray-800 mb-2">{first?.name}</span>
        <div className="flex items-center gap-6 text-[11px] text-gray-500">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full bg-[#C9A96F]"></span>
              <span className="font-medium text-gray-700">{first?.accuracy}%</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Accuracy</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 text-xs">⚡</span>
              <span className="font-medium text-gray-700">{first?.totalPoints.toLocaleString()}</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Total Points</span>
          </div>
        </div>
      </div>

      {/* 3rd Place - Right */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="w-[85px] h-[85px] rounded-full overflow-hidden border-[3px] border-[#E8D4B8] bg-gray-100">
            <img
              src={third?.avatar}
              alt={third?.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Rank badge - top right */}
          <img
            src="/icons/Leaderboard/3rd.svg"
            height={30}
            width={30}
            className="absolute -top-1 -left-1"
          />
        </div>
        <span className="text-[13px] font-medium text-gray-800 mb-2">{third?.name}</span>
        <div className="flex items-center gap-6 text-[11px] text-gray-500">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full bg-[#C9A96F]"></span>
              <span className="font-medium text-gray-700">{third?.accuracy}%</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Accuracy</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 text-xs">⚡</span>
              <span className="font-medium text-gray-700">{third?.totalPoints.toLocaleString()}</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Total Points</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Table Row - matching exact image styling
function LeaderboardRow({ user }: { user: typeof leaderboardData[0] }) {
  const isTopThree = user.rank <= 3;
  const isCurrentUser = user.isCurrentUser;

  let borderColor = "border-gray-200";
  let bgColor = "bg-white";
  
  if (isTopThree) {
    borderColor = "border-[#D4B896]";
  }
  if (isCurrentUser) {
    borderColor = "border-[#8A1538]";
    bgColor = "bg-[#FEF0F2]";
  }

  return (
    <div className={`flex items-center px-4 py-3.5 rounded-xl border ${borderColor} ${bgColor} mb-2.5 transition-all hover:shadow-sm`}>
      {/* Rank */}
      <div className="w-14 flex items-center justify-center">
        <span className={`text-base font-semibold ${isCurrentUser ? 'text-[#8A1538]' : 'text-gray-600'}`}>
          {user.rank}
        </span>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 ml-2">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span className={`text-sm font-medium ${isCurrentUser ? 'text-[#8A1538]' : 'text-gray-700'}`}>
          {user.name}
        </span>
      </div>

      {/* Total Points */}
      <div className="w-36 text-center">
        <span className={`text-sm font-medium ${isCurrentUser ? 'text-[#8A1538]' : 'text-gray-600'}`}>
          {user.totalPoints.toLocaleString()}
        </span>
      </div>

      {/* Accuracy */}
      <div className="w-28 text-center">
        <span className={`text-sm font-medium ${isCurrentUser ? 'text-[#8A1538]' : 'text-gray-600'}`}>
          {user.accuracy}%
        </span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartMsgOpen, setIsStartMsgOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Navbar */}
      <KhatebNavbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeView="leaderboard" />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-72" : "ml-16"
          } overflow-y-auto bg-[#FAFAFA]`}
        >
          <div className="p-6 max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-xl font-semibold text-[#8A1538] mb-6">Leaderboard</h1>

            {/* Top 3 Podium */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <TopThreePodium />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Table Header */}
              <div className="flex items-center px-4 py-2 mb-3 text-xs text-gray-400 font-medium uppercase tracking-wide">
                <div className="w-14 text-center">Rank</div>
                <div className="flex-1 ml-2"></div>
                <div className="w-36 text-center">Total Points</div>
                <div className="w-28 text-center">Accuracy</div>
              </div>

              {/* Leaderboard Rows */}
              <div>
                {leaderboardData.map((user) => (
                  <LeaderboardRow key={user.rank} user={user} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Messages Button (floating) */}
      <button
        onClick={() => setIsMessagesOpen(true)}
        className="fixed bottom-6 right-6 bg-[#7A1233] text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:bg-[#6d1029] transition-colors z-40"
      >
        <span className="text-sm font-medium">Messages</span>
        <svg className="w-3 h-3" viewBox="0 0 12 6" fill="none">
          <path
            d="M1 5l5-4 5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenStart={() => setIsStartMsgOpen(true)}
      />

      {/* Start New Message Modal */}
      {isStartMsgOpen && (
        <StartNewMessage
          isOpen={isStartMsgOpen}
          onClose={() => setIsStartMsgOpen(false)}
          users={sampleUsers}
          onSelect={(user) => {
            console.log("Selected user:", user);
            setIsStartMsgOpen(false);
          }}
        />
      )}
    </div>
  );
}
