"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SuggestedUserCard from "./SuggestedUserCard";

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  suggestion_reason: string;
  followers_count: number;
  score: number;
}

export default function SuggestedUsersRow() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingFollowIds, setLoadingFollowIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSuggested() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/api/feed/suggested", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch suggested users");
        }

        const data = await res.json();
        console.log("Suggested users from server:", data.suggested_users); // Log the suggested users
        setUsers(data.suggested_users || []);
      } catch (err) {
        console.error("Error fetching suggested users:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggested();
  }, []);

  // Enable horizontal scrolling with mouse wheel (like touch)
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY * 0.5; // Adjust multiplier for sensitivity
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 200; // Adjust scroll amount as needed (e.g., card width + gap)
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 200; // Adjust scroll amount as needed
    }
  };

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isCurrentlyFollowing = followingIds.has(userId);
    
    // Optimistic update
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyFollowing) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });

    setLoadingFollowIds((prev) => new Set(prev).add(userId));

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/follow", {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ target_user_id: userId }),
      });

      if (!res.ok) {
        // Revert on failure
        setFollowingIds((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyFollowing) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error("Follow error:", err);
      // Revert on error
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    } finally {
      setLoadingFollowIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full py-4">
        <h3 className="text-[#7b2030] font-semibold mb-4 px-2">People you may know</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse flex-shrink-0"
              style={{
                width: 179,
                height: 275,
                borderRadius: 8,
                background: "#f3f4f6",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  // Show first 6 users in the row
  const displayUsers = users.slice(0, 16);

  return (
    <div className="w-full py-4">
      <h3 className="text-[#7b2030] font-semibold mb-4 px-2">People you may know</h3>
      <div className="relative">
        {/* Left Navigation Button */}
        <button
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
          style={{ marginLeft: "-20px" }}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {displayUsers.map((user) => (
            <div key={user.id} className="flex-shrink-0">
              <SuggestedUserCard
                user={user}
                isFollowing={followingIds.has(user.id)}
                isLoading={loadingFollowIds.has(user.id)}
                onFollow={handleFollow}
              />
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
          style={{ marginRight: "-20px" }}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      
    </div>
  );
}
