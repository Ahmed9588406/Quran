/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import FatwaCard from "./fatwaCard";
import AnsweredFatwaCard from "./AnsweredFatwaCard";
import KhatebNavbar from "../KhatebNavbar";
import Sidebar from "../../khateeb_Profile/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Tab types - only pending and answered (rejected endpoint not available)
type TabType = "pending" | "answered";

interface Fatwa {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  isAnonymous: boolean;
  asker: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    displayName?: string;
    profilePictureUrl?: string | null;
    avatarUrl?: string | null;
  } | null;
  targetPreacher: any | null;
  answeredBy: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio?: string;
    isVerified?: boolean;
  } | null;
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
  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  
  // Separate state for each tab (pending and answered only)
  const [pendingFatwas, setPendingFatwas] = useState<Fatwa[]>([]);
  const [answeredFatwas, setAnsweredFatwas] = useState<Fatwa[]>([]);
  
  // Loading states for each tab
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAnswered, setLoadingAnswered] = useState(true);
  
  // Error states for each tab
  const [errorPending, setErrorPending] = useState<string | null>(null);
  const [errorAnswered, setErrorAnswered] = useState<string | null>(null);
  
  // Pagination states
  const [pagePending, setPagePending] = useState(0);
  const [pageAnswered, setPageAnswered] = useState(0);
  
  const [hasMorePending, setHasMorePending] = useState(true);
  const [hasMoreAnswered, setHasMoreAnswered] = useState(true);
  
  // Preacher info
  const [preacherInfo, setPreacherInfo] = useState({
    name: "Preacher",
    avatar: "",
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load preacher info from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const firstName = user.firstName || user.first_name || user.name?.split(' ')[0] || '';
        const lastName = user.lastName || user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatar || user.avatar_url || '';
        
        setPreacherInfo({
          name: fullName || "Preacher",
          avatar: avatar,
        });
        
        console.log("[Fatwas] ✓ Preacher credentials loaded:", {
          name: fullName || "Preacher",
          hasAvatar: !!avatar,
        });
      }
    } catch (e) {
      console.error("[Fatwas] Error parsing user data:", e);
    }
  }, []);

  // Fetch fatwas by status (pending or answered only)
  const fetchFatwas = async (status: TabType, pageNum: number = 0) => {
    const setLoading = status === "pending" ? setLoadingPending : setLoadingAnswered;
    const setError = status === "pending" ? setErrorPending : setErrorAnswered;
    const setFatwas = status === "pending" ? setPendingFatwas : setAnsweredFatwas;
    const setHasMore = status === "pending" ? setHasMorePending : setHasMoreAnswered;
    const setPage = status === "pending" ? setPagePending : setPageAnswered;
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log(`[Fatwas] Fetching ${status} fatwas, page ${pageNum}`);

      const response = await fetch(
        `/api/khateb_Studio/fatwas?status=${status}&page=${pageNum}&size=20&sort=createdAt,desc`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch ${status} fatwas: ${response.status} - ${errorData.details || response.statusText}`
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
      
      console.log(`[Fatwas] ✓ Loaded ${data.content.length} ${status} fatwas`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      console.error(`[Fatwas] Error fetching ${status}:`, errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Load pending and answered tabs on mount
  useEffect(() => {
    fetchFatwas("pending", 0);
    fetchFatwas("answered", 0);
  }, []);

  // Handle answer submission
  const handleAnswer = async (fatwaId: string, answer: string) => {
    const toastId = toast.loading("📤 Submitting your answer...");
    
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await fetch(`/api/khateb_Studio/fatwas?fatwaId=${fatwaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: answer.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      // Remove from pending list
      setPendingFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
      
      // Refresh answered list
      fetchFatwas("answered", 0);
      
      toast.update(toastId, {
        render: "✅ Answer submitted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit answer";
      toast.update(toastId, {
        render: `❌ ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
    }
  };

  // Handle reject
  const handleReject = async (fatwaId: string) => {
    if (!confirm("Are you sure you want to reject this fatwa?")) return;

    const toastId = toast.loading("🚫 Rejecting fatwa...");
    
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

      // Remove from pending list
      setPendingFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
      
      toast.update(toastId, {
        render: "✅ Fatwa rejected successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reject fatwa";
      toast.update(toastId, {
        render: `❌ ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
    }
  };

  // Load more for current tab
  const loadMore = () => {
    if (activeTab === "pending" && !loadingPending && hasMorePending) {
      fetchFatwas("pending", pagePending + 1);
    } else if (activeTab === "answered" && !loadingAnswered && hasMoreAnswered) {
      fetchFatwas("answered", pageAnswered + 1);
    }
  };

  // Get current tab data
  const getCurrentFatwas = () => {
    switch (activeTab) {
      case "pending": return pendingFatwas;
      case "answered": return answeredFatwas;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case "pending": return loadingPending;
      case "answered": return loadingAnswered;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case "pending": return errorPending;
      case "answered": return errorAnswered;
    }
  };

  const getCurrentHasMore = () => {
    switch (activeTab) {
      case "pending": return hasMorePending;
      case "answered": return hasMoreAnswered;
    }
  };

  const fatwas = getCurrentFatwas();
  const loading = getCurrentLoading();
  const error = getCurrentError();
  const hasMore = getCurrentHasMore();

  // Tab counts
  const tabCounts = {
    pending: pendingFatwas.length,
    answered: answeredFatwas.length,
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

      {/* Main content */}
      <main
        className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-16"}`}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-[#8A1538] mb-6">Fatwas Management</h1>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors relative ${
                activeTab === "pending"
                  ? "text-[#8A1538] border-b-2 border-[#8A1538]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending
                {tabCounts.pending > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tabCounts.pending}
                  </span>
                )}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab("answered")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors relative ${
                activeTab === "answered"
                  ? "text-[#8A1538] border-b-2 border-[#8A1538]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Answered
                {tabCounts.answered > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tabCounts.answered}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Loading state */}
          {loading && fatwas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading {activeTab} fatwas...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchFatwas(activeTab, 0)}
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
                {activeTab === "pending" && (
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {activeTab === "answered" && (
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No {activeTab} fatwas
              </h3>
              <p className="text-gray-500 mt-1">
                {activeTab === "pending" && "You're all caught up! Check back later."}
                {activeTab === "answered" && "No fatwas have been answered yet."}
              </p>
            </div>
          )}

          {/* Fatwas list */}
          <div className="flex flex-col items-center gap-6">
            {fatwas.map((fatwa) => (
              activeTab === "pending" ? (
                <FatwaCard
                  key={fatwa.id}
                  fatwa={fatwa}
                  preacherName={preacherInfo.name}
                  preacherAvatar={preacherInfo.avatar}
                  onAnswer={handleAnswer}
                  onReject={handleReject}
                />
              ) : (
                <AnsweredFatwaCard
                  key={fatwa.id}
                  fatwa={fatwa}
                  status="answered"
                />
              )
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

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
