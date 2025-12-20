"use client";
import React, { useState, useEffect } from "react";
import { Radio, MapPin, Users, Disc, TrendingUp, Activity } from "lucide-react";
import { streamAPI, LiveStreamRoom } from "@/lib/streaming/api";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  bgColor?: string;
};

function StatCard({ title, value, subtitle, icon, trend, bgColor = "bg-white" }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-5 shadow-sm border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-[#231217]">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`w-3 h-3 ${!trend.isPositive && "rotate-180"}`} />
              <span>{trend.value}% from last week</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#FFF9F3] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentStreamCard({ stream }: { stream: LiveStreamRoom }) {
  const statusColors = {
    active: "bg-green-100 text-green-700",
    ended: "bg-gray-100 text-gray-600",
    scheduled: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="w-12 h-12 rounded-full bg-[#8A1538] flex items-center justify-center shrink-0">
        <Radio className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#231217] truncate">{stream.title || `Stream #${stream.id}`}</p>
        <p className="text-xs text-gray-500">{stream.mosqueName || "Unknown Mosque"}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[stream.status || "ended"]}`}>
          {stream.status || "ended"}
        </span>
        <div className="flex items-center gap-1 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-xs">{stream.listeners || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeStreams: 0,
    totalListeners: 0,
    totalRecordings: 0,
  });
  const [recentStreams, setRecentStreams] = useState<LiveStreamRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms
        const roomsResponse = await streamAPI.getAllRooms(0, 10);
        const rooms = roomsResponse.content || [];
        
        // Calculate stats
        const activeCount = rooms.filter(r => r.status === "active").length;
        const totalListeners = rooms.reduce((sum, r) => sum + (r.listeners || 0), 0);
        const recordingsCount = rooms.filter(r => r.recordingAvailable).length;

        setStats({
          totalRooms: roomsResponse.totalElements || rooms.length,
          activeStreams: activeCount,
          totalListeners,
          totalRecordings: recordingsCount,
        });

        setRecentStreams(rooms.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set mock data for demo
        setStats({
          totalRooms: 12,
          activeStreams: 3,
          totalListeners: 156,
          totalRecordings: 8,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#8A1538]">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage live streaming operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle="All streaming rooms"
          icon={<Radio className="w-6 h-6 text-[#8A1538]" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Streams"
          value={stats.activeStreams}
          subtitle="Currently live"
          icon={<Activity className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Total Listeners"
          value={stats.totalListeners}
          subtitle="Across all streams"
          icon={<Users className="w-6 h-6 text-[#8A1538]" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Recordings"
          value={stats.totalRecordings}
          subtitle="Available recordings"
          icon={<Disc className="w-6 h-6 text-[#8A1538]" />}
        />
      </div>

      {/* Recent Streams */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#231217]">Recent Streams</h2>
          <button className="text-sm text-[#8A1538] hover:underline">View all</button>
        </div>

        <div className="space-y-3">
          {recentStreams.length > 0 ? (
            recentStreams.map((stream) => (
              <RecentStreamCard key={stream.id} stream={stream} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Radio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No streams yet</p>
              <p className="text-sm">Create a new stream to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center gap-3 p-4 bg-[#8A1538] text-white rounded-xl hover:bg-[#6d1029] transition-colors">
          <Radio className="w-5 h-5" />
          <span className="font-medium">Create New Room</span>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white border border-[#8A1538] text-[#8A1538] rounded-xl hover:bg-[#FFF9F3] transition-colors">
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Manage Mosques</span>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
          <Disc className="w-5 h-5" />
          <span className="font-medium">View Recordings</span>
        </button>
      </div>
    </div>
  );
}
