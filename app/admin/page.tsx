"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";
import DashboardOverview from "./components/DashboardOverview";
import StreamsManagement from "./components/StreamsManagement";
import MosquesMap from "./components/MosquesMap";
import RecordingsPanel from "./components/RecordingsPanel";

type AdminView = "dashboard" | "streams" | "mosques" | "recordings";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");

        if (!userStr || !token) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const userRole = user.role?.toLowerCase();

        if (userRole !== "admin") {
          // Non-admin users redirect to their appropriate page
          const userId = user.id || localStorage.getItem("user_id");
          if (userRole === "preacher") {
            router.replace(`/khateb_Studio/${userId}`);
          } else {
            router.replace(`/user/${userId}`);
          }
          return;
        }

        setUserName(user.display_name || user.username || "Admin");
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF9F3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A1538] font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview />;
      case "streams":
        return <StreamsManagement />;
      case "mosques":
        return <MosquesMap />;
      case "recordings":
        return <RecordingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="h-screen bg-[#FFF9F3] flex flex-col overflow-hidden">
      <AdminNavbar
        userName={userName}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          isOpen={isSidebarOpen}
          activeView={activeView}
          onViewChange={setActiveView}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main
          className={`flex-1 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          <div className="h-full p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </main>
      </div>

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
      />
    </div>
  );
}
