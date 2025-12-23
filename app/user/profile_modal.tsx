/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, LogOut, X } from "lucide-react";
import { getProfileRoute, clearSession } from "@/lib/auth-helpers";

type UserData = {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  tags?: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user?: UserData;
};

export default function ProfileModal({ isOpen, onClose, user }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [profileHref, setProfileHref] = useState("/user-profile");
  const [userData, setUserData] = useState<UserData | null>(user || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dynamic profile route on mount (client-side only)
  useEffect(() => {
    setProfileHref(getProfileRoute());
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear session from localStorage
      clearSession();
      
      // Close the modal
      onClose();
      
      // Redirect to login page
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  }

  // Fetch user profile data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        const profile = data?.user || data?.data?.user || data;
        setUserData({
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name || profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url?.startsWith("http") ? profile.avatar_url : profile.avatar_url ? `http://apisoapp.twingroups.com${profile.avatar_url}` : "/icons/settings/profile.png",
          followers_count: profile.followers_count || 0,
          following_count: profile.following_count || 0,
          posts_count: profile.posts_count || 0,
          tags: profile.tags || [],
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchUserProfile();
    } else {
      setUserData(user);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const u = userData || {
    display_name: "Loading...",
    username: "",
    avatar_url: "/icons/settings/profile.png",
    bio: "",
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    tags: [],
  };

  return (
    <div
      ref={ref}
      className="w-[360px] max-w-[92vw] bg-[#fff6f3] border border-[#f0e6e5] rounded-2xl shadow-xl text-gray-900 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0">
              <img
                src={u.avatar_url}
                alt="User profile"
                width={48}
                height={48}
                className="object-cover"
                draggable={false}
              />
            </div>
            <div>
              <div className="text-sm font-semibold truncate">{u.display_name}</div>
              <div className="text-xs text-gray-600 mt-0.5">@{u.username}</div>
            </div>
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        

        {/* Bio */}
        {u.bio && (
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{u.bio}</p>
        )}

        {/* Tags */}
        {u.tags && u.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {u.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3">
          <Link
            href={profileHref}
            onClick={() => onClose()}
            className="block w-full text-center text-[#7b2030] text-sm font-medium py-2 rounded-md hover:bg-gray-50"
          >
            View your profile
          </Link>
        </div>
      </div>

      <div className="h-px bg-[#e7d9d2]" />

      <div className="p-3 space-y-2">
        <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/60">
            <Globe className="w-4 h-4 text-gray-700" />
          </span>
          <span className="text-sm text-gray-800">Language · English</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/60">
            <LogOut className="w-4 h-4 text-gray-700" />
          </span>
          <span className="text-sm text-gray-800">Sign out</span>
        </button>
      </div>

      {loading && (
        <div className="p-4 text-center text-sm text-gray-500">Loading profile...</div>
      )}

      {error && (
        <div className="p-4 text-center text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}
