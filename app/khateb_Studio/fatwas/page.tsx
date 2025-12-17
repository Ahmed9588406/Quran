"use client";
import { useEffect, useState } from "react";
import FatwaCard from "./fatwaCard";
import KhatebNavbar from "../KhatebNavbar";
import Sidebar from "../../khateeb_Profile/Sidebar";

interface Fatwa {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  isAnonymous: boolean;
  asker: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
  } | null;
  targetPreacher: any | null;
  answeredBy: any | null;
  createdAt: string;
  answeredAt: string | null;
}

interface FatwaResponse {
  content: Fatwa[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
}

export default function FatwasPage() {
  const [fatwas, setFatwas] = useState<Fatwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [preacherInfo, setPreacherInfo] = useState({
    name: "Preacher",
    avatar: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get preacher info from localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setPreacherInfo({
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Preacher",
          avatar: user.profilePictureUrl || "",
        });
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }, []);

  const fetchFatwas = async (pageNum: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Try multiple token keys since different parts of the app might store it differently
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log("Fetching fatwas with token:", token ? "present" : "missing");

      const response = await fetch(
        `/api/khateb_Studio/fatwas?page=${pageNum}&size=20&sort=createdAt,desc`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch fatwas: ${response.status} - ${errorData.details || response.statusText}`
        );
      }

      const data: FatwaResponse = await response.json();

      if (pageNum === 0) {
        setFatwas(data.content);
      } else {
        setFatwas((prev) => [...prev, ...data.content]);
      }

      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      console.error("Fetch error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFatwas(0);
  }, []);

  const handleAnswer = async (fatwaId: string, answer: string) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const response = await fetch("/api/khateb_Studio/fatwas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ fatwaId, answer }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      // Remove answered fatwa from list
      setFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
    } catch (err) {
      console.error("Error answering fatwa:", err);
      alert("Failed to submit answer. Please try again.");
    }
  };

  const handleReject = async (fatwaId: string) => {
    if (!confirm("Are you sure you want to reject this fatwa?")) return;

    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const response = await fetch(
        `/api/khateb_Studio/fatwas?fatwaId=${fatwaId}`,
        {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject fatwa");
      }

      // Remove rejected fatwa from list
      setFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
    } catch (err) {
      console.error("Error rejecting fatwa:", err);
      alert("Failed to reject fatwa. Please try again.");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchFatwas(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F3]">
      {/* Navbar */}
      <KhatebNavbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView="fatwas"
      />

      {/* Main content with sidebar offset */}
      <main
        className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-16"}`}
      >
        

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Loading state */}
          {loading && fatwas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading fatwas...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchFatwas(0)}
                className="mt-2 text-sm text-[#8A1538] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && fatwas.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No pending fatwas
              </h3>
              <p className="text-gray-500 mt-1">
                You&apos;re all caught up! Check back later.
              </p>
            </div>
          )}

          {/* Fatwas feed */}
          <div className="flex flex-col items-center gap-6">
            {fatwas.map((fatwa) => (
              <FatwaCard
                key={fatwa.id}
                fatwa={fatwa}
                preacherName={preacherInfo.name}
                preacherAvatar={preacherInfo.avatar}
                onAnswer={handleAnswer}
                onReject={handleReject}
              />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && fatwas.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-[#8A1538] text-white rounded-xl font-medium hover:bg-[#6B102C] transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
