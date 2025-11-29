import React from 'react';
import Image from 'next/image';
interface LeaderboardEntry {
  id: string;
  name: string;
  time: string;
  points: number;
  avatar: string;
  rank: number;
}

const mockData: LeaderboardEntry[] = [
  { id: '1', name: 'Adam Collins', time: '16 mins', points: 4000, avatar: '/icons/Leaderboard/profile.svg', rank: 1 },
  { id: '2', name: 'Adam Collins', time: '16 mins', points: 4000, avatar: '/icons/Leaderboard/winer2.svg', rank: 2 },
  { id: '3', name: 'Adam Collins', time: '16 mins', points: 4000, avatar: '/icons/Leaderboard/winer3.svg', rank: 3 },
];



export default function Leaderboard() {
  return (
    <div className="bg-[#fdfcfc] border border-[#e5d4e0] p-6 rounded-2xl shadow-sm overflow-hidden w-[380px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">Leaderboard</h2>
        <button className="text-base text-gray-600 hover:text-gray-800">See all</button>
      </div>
      <div className="flex flex-col gap-4">
        {mockData.map((item) => (
          <div 
            key={item.id} 
            className="flex justify-between items-center bg-[#F7E9CF] rounded-lg p-3 max-w-full h-[60px] overflow-hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#E8DCC8] flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image src={item.avatar} alt="Profile" width={40} height={40} />
              </div>
              <div className="overflow-hidden">
                <p className="text-base font-medium text-black leading-tight truncate">{item.name}</p>
                <p className="text-sm text-gray-600 leading-tight truncate">{item.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#E8DCC8] px-3 py-1.5 rounded-xl flex-shrink-0">
              <Image src="/icons/Leaderboard/fire.svg" alt="Coin" width={14} height={14} />
              <span className="text-sm font-semibold text-black">{item.points}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
