"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import KhatebNavbar from "../KhatebNavbar";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import KhatebProfileModal from "../KhatebProfileModal";
import dynamic from "next/dynamic";
import CreateModal from "../CreateModal";
import UploadModal from "../UploadModal";
import UploadSuccessModal from "../UploadSuccessModal";
import GoLiveModal from "../GoLiveModal";
import AudioModal from "../Audio_modal";
import MicrophoneSettingsModal from "../MicrophoneSettingsModal";
import PDFViewerModal from "../PDFViewerModal";

const StartNewMessage = dynamic(() => import("../../user/start_new_message"), { ssr: false });

// Types
type StatCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

type User = { id: string; name: string; avatar: string };

// Stat Card Component
function StatCard({ title, subtitle, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-[#FFF9F3] rounded-lg flex-1 min-w-[250px] h-[93px]">
      <div className="flex-1 flex flex-col gap-4">
        <span className="text-lg font-medium text-[#160309]">{title}</span>
        <span className="text-sm text-[#333333]">{subtitle}</span>
      </div>
      <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>
  );
}

// Helper function to format date as ISO string (YYYY-MM-DD)
function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Scheduled Khotba type
interface ScheduledKhotba {
  id: string | number;
  title?: string;
  airTime?: string;
  color?: string;
  isKhotba?: boolean;
}

// Calendar Component with Scheduled Khotba Dots
function Calendar({ onKhotbaClick }: { onKhotbaClick?: (khotba: ScheduledKhotba, date: string) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledKhotbas, setScheduledKhotbas] = useState<Record<string, ScheduledKhotba[]>>({});
  const today = new Date();
  
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  // Load scheduled khotbas from localStorage
  useEffect(() => {
    const loadScheduledKhotbas = () => {
      try {
        const stored = localStorage.getItem('scheduled_khotbas');
        if (stored) {
          setScheduledKhotbas(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading scheduled khotbas:', error);
      }
    };

    loadScheduledKhotbas();

    // Listen for storage changes (in case khotba is scheduled in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'scheduled_khotbas') {
        loadScheduledKhotbas();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when khotba is scheduled in same tab
    const handleKhotbaScheduled = () => loadScheduledKhotbas();
    window.addEventListener('khotba-scheduled', handleKhotbaScheduled);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('khotba-scheduled', handleKhotbaScheduled);
    };
  }, []);

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  
  // Build previous month days with full date info
  const prevMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => {
    const day = prevMonthLastDay - startingDayOfWeek + i + 1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
    return {
      day,
      isCurrentMonth: false,
      isoDate: toISODate(date),
    };
  });

  // Build current month days with full date info
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return {
      day,
      isCurrentMonth: true,
      isToday:
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear(),
      isoDate: toISODate(date),
    };
  });

  const totalDaysShown = prevMonthDays.length + currentMonthDays.length;
  const remainingDays = 42 - totalDaysShown;
  
  // Build next month days with full date info
  const nextMonthDays = Array.from({ length: Math.min(remainingDays, 7) }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    return {
      day,
      isCurrentMonth: false,
      isoDate: toISODate(date),
    };
  });

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a date has scheduled khotbas
  const hasScheduledKhotba = (isoDate: string): boolean => {
    return scheduledKhotbas[isoDate] && Array.isArray(scheduledKhotbas[isoDate]) && scheduledKhotbas[isoDate].length > 0;
  };

  // Get scheduled khotbas for a date
  const getScheduledKhotbas = (isoDate: string): ScheduledKhotba[] => {
    return scheduledKhotbas[isoDate] || [];
  };

  // Handle date click
  const handleDateClick = (isoDate: string) => {
    const khotbas = getScheduledKhotbas(isoDate);
    if (khotbas.length > 0 && onKhotbaClick) {
      // Open the first khotba for this date
      onKhotbaClick(khotbas[0], isoDate);
    }
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-md w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-medium text-[#CFAE70]">{monthName}</span>
          <span className="text-[25px] font-medium text-[#CFAE70]">{year}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="w-[27px] h-[27px] flex items-center justify-center text-[12px] font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.slice(0, 42).map((dayObj, index) => {
          const hasKhotba = hasScheduledKhotba(dayObj.isoDate);
          const isToday = "isToday" in dayObj && dayObj.isToday;
          
          return (
            <div
              key={index}
              className="relative flex flex-col items-center"
              title={hasKhotba ? "Click to view Khotba PDF" : undefined}
            >
              <div
                onClick={() => hasKhotba && handleDateClick(dayObj.isoDate)}
                className={`w-[27px] h-[27px] flex items-center justify-center text-[15px] font-medium rounded-full cursor-pointer transition-all
                  ${!dayObj.isCurrentMonth ? "text-[#8A1538] opacity-20" : "text-[#8A1538]"}
                  ${isToday ? "bg-[#CFAE70] text-white" : "hover:bg-gray-100"}
                  ${hasKhotba && !isToday ? "ring-2 ring-green-500 ring-offset-1 hover:ring-green-600 hover:scale-110" : ""}
                  ${hasKhotba ? "cursor-pointer" : ""}
                `}
              >
                {dayObj.day}
              </div>
              {/* Green dot indicator for scheduled khotbas */}
              {hasKhotba && (
                <div className="absolute -bottom-1 w-[6px] h-[6px] rounded-full bg-green-500" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-[6px] h-[6px] rounded-full bg-green-500" />
          <span>Scheduled Khotba (click to view PDF)</span>
        </div>
      </div>
    </div>
  );
}

// Channel Analytics Component
function ChannelAnalytics() {
  return (
    <div className="bg-white border border-[#CFAE70] rounded-lg p-6 flex flex-col gap-6 w-full max-w-[363px] flex-1 overflow-hidden">
      <div className="flex flex-col gap-2 pb-4 border-b border-[#CFAE70] shrink-0">
        <h3 className="text-lg font-medium text-[#160309]">Channel analytics</h3>
        <p className="text-sm text-[#160309]">Current subscribers</p>
        <p className="text-sm text-[#160309]">0</p>
      </div>

      <div className="flex flex-col gap-4 pb-4 border-b border-[#CFAE70] shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#160309]">Summary</span>
            <span className="text-xs text-[#666666]">Last 28 days</span>
          </div>
          <p className="text-sm text-[#160309]">0</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[#160309]">Views</span>
            <span className="text-[11px] text-[#160309]">0 -</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[#160309]">Watch time (hours)</span>
            <span className="text-[11px] text-[#160309]">0.0 -</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        <span className="text-sm font-medium text-[#160309]">Top videos</span>
        <span className="text-xs text-[#666666]">Last 48 hours · Views</span>
        <div className="flex-1 flex items-center justify-center text-xs text-[#666666]">
          No videos yet
        </div>
      </div>
    </div>
  );
}

// Video Upload Card Component
function VideoUploadCard({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="bg-white border border-[#D7BA83] rounded-lg p-4 flex flex-col items-center justify-center gap-3 w-full max-w-[362px] flex-1 min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/icons/Khateb_studio/pana.svg"
          alt="Upload Video"
          width={150}
          height={150}
          className="w-50 h-50 text-gray-400"
        />
        <p className="text-sm text-[#160309] text-center max-w-[280px]">
          Want to see metrics on your recent video?
          <br />
          Upload and publish a video to get started.
        </p>
      </div>

      <button
        onClick={onUploadClick}
        className="bg-[#8A1538] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#6d1029] transition-colors"
      >
        Upload videos
      </button>
    </div>
  );
}

// Prepare Khotba Card
function PrepareKhotbaCard() {
  return (
    <Link
      href="/Schedual/prepare_khotba"
      className="flex items-center justify-between bg-[#D7BA83] rounded-lg px-2 py-2 mb-50 w-full hover:bg-[#c9a96f] transition-colors"
    >
      <span className="text-xs font-medium text-[#8A1538]">Prepare your next khotba</span>
      <div className="w-6 h-6 flex items-center justify-center">
        <Pencil className="w-4 h-4 text-[#8A1538]" />
      </div>
    </Link>
  );
}

// Sample users for Start New Message
const sampleUsers: User[] = [
  { id: "u1", name: "Ahmed Abdullah", avatar: "https://i.pravatar.cc/80?img=1" },
  { id: "u2", name: "Mohammed Ali", avatar: "https://i.pravatar.cc/80?img=2" },
  { id: "u3", name: "Fatima Hassan", avatar: "https://i.pravatar.cc/80?img=3" },
  { id: "u4", name: "Sara Omar", avatar: "https://i.pravatar.cc/80?img=4" },
  { id: "u5", name: "Yusuf Ibrahim", avatar: "https://i.pravatar.cc/80?img=5" },
];

/**
 * Dynamic Preacher Studio Page
 * Route: /khateb_Studio/[id]
 * Handles individual preacher studio pages with role-based access control
 */
export default function DynamicKhateebStudioPage({ params }: { params: Promise<{ id: string }> }) {
  // State declarations - ALL at the top before any conditionals
  const [preacherId, setPreacherId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartMsgOpen, setIsStartMsgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<DOMRect | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAnchor, setCreateAnchor] = useState<DOMRect | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploadSuccessOpen, setIsUploadSuccessOpen] = useState(false);
  const [uploadSuccessAnchor, setUploadSuccessAnchor] = useState<DOMRect | null>(null);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isMicSettingsOpen, setIsMicSettingsOpen] = useState(false);
  const [liveRoomInfo, setLiveRoomInfo] = useState<{ roomId: number; liveStreamId: number; topic?: string } | null>(null);
  
  // PDF Viewer state
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [selectedKhotbaDoc, setSelectedKhotbaDoc] = useState<{
    id: string | number;
    title?: string;
    date?: string;
  } | null>(null);

  const router = useRouter();

  // Effect to unwrap params and set preacherId
  useEffect(() => {
    params.then(({ id }) => {
      setPreacherId(id);
    });
  }, [params]);

  // Authorization check effect
  useEffect(() => {
    if (!preacherId) return;

    const checkAuthorization = () => {
      try {
        const userStr = localStorage.getItem("user");
        const userId = localStorage.getItem("user_id");

        if (!userStr || !userId) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const userRole = user.role?.toLowerCase();

        // Check if user is a preacher
        if (userRole !== "preacher") {
          router.replace(`/user/${userId}`);
          return;
        }

        // Check if the logged-in preacher is accessing their own studio
        if (userId !== preacherId) {
          router.replace(`/khateb_Studio/${userId}`);
          return;
        }

        // All checks passed
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Authorization check failed:", error);
        router.replace("/login");
      }
    };

    checkAuthorization();
  }, [preacherId, router]);

  // Listen for global event to open audio modal
  useEffect(() => {
    const handler = () => setIsAudioOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("open-audio-modal", handler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-audio-modal", handler as EventListener);
      }
    };
  }, []);

  // Listen for global event to open mic settings
  useEffect(() => {
    const handler = () => setIsMicSettingsOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("open-mic-settings", handler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-mic-settings", handler as EventListener);
      }
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A1538] font-medium">Loading Studio...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Khateb Navbar */}
      <KhatebNavbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onOpenMessages={() => setIsMessagesOpen(true)}
        onProfileClick={(e) => {
          const btn = document.getElementById("khateb-avatar-btn");
          const rect = btn
            ? btn.getBoundingClientRect()
            : (e.currentTarget as HTMLElement).getBoundingClientRect();
          setProfileAnchor(rect);
          setIsProfileOpen(true);
        }}
        onCreateClick={(e) => {
          const btn = document.getElementById("khateb-create-btn");
          const rect = btn
            ? btn.getBoundingClientRect()
            : (e.currentTarget as HTMLElement).getBoundingClientRect();
          setCreateAnchor(rect);
          setIsCreateOpen(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeView="studio" />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-72" : "ml-16"
          } overflow-hidden`}
        >
          <div className="h-full p-6 flex flex-col">
            {/* Sticky header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm -mx-6 px-6 py-12 border-b border-gray-100">
              <div className="flex items-center justify-between mb-0">
                <h1 className="text-[32px] font-medium text-[#8A1538]">Studio</h1>
                
              </div>
            </div>

            {/* Stat Cards Row */}
            <div className="flex gap-4 mb-6 shrink-0">
              <StatCard
                title="Upcoming khotba"
                subtitle="10:00 AM - Katara Mosque - next Friday"
                icon={
                  <div className="w-[60px] h-[60px] rounded-full bg-linear-to-br flex items-center justify-center">
                    <Image
                      src="/icons/Khateb_studio/calender.svg"
                      alt="Calendar"
                      width={60}
                      height={50}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                }
              />
              <StatCard
                title="Replay to messages"
                subtitle="150 question"
                icon={
                  <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center">
                    <Image
                      src="/icons/Khateb_studio/done.svg"
                      alt="Messages"
                      width={60}
                      height={50}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                }
              />
              <StatCard
                title="Fatwa questions"
                subtitle="200 question"
                icon={
                  <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center">
                    <Image
                      src="/icons/Khateb_studio/question.svg"
                      alt="Questions"
                      width={60}
                      height={50}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                }
              />
              <StatCard
                title="live"
                subtitle="scadule / live"
                icon={
                  <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center">
                    <Image
                      src="/icons/khateb_studio/live.svg"
                      alt="Live"
                      width={60}
                      height={50}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                }
              />
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
              {/* Left Column - Video Upload */}
              <div className="flex flex-col">
                <VideoUploadCard onUploadClick={() => setIsUploadOpen(true)} />
              </div>

              {/* Middle Column - Channel Analytics */}
              <div className="flex flex-col">
                <ChannelAnalytics />
              </div>

              {/* Right Column - Calendar & Prepare Khotba */}
              <div className="flex flex-col gap-4">
                <Calendar 
                  onKhotbaClick={(khotba, date) => {
                    setSelectedKhotbaDoc({
                      id: khotba.id,
                      title: khotba.title || "Khotba Document",
                      date: new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                    });
                    setIsPDFViewerOpen(true);
                  }}
                />
                <PrepareKhotbaCard />
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
        <span className="text-base font-medium">Messages</span>
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

      {/* Khateb Profile Modal */}
      <KhatebProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        anchorRect={profileAnchor}
      />

      {/* Create Modal */}
      <CreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        anchorRect={createAnchor}
        onOpenUpload={() => {
          setIsUploadOpen(true);
          setIsCreateOpen(false);
        }}
        onOpenGoLive={() => {
          setIsGoLiveOpen(true);
          setIsCreateOpen(false);
        }}
      />

      {/* Upload Modal */}
      <UploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          const audioEl =
            typeof document !== "undefined" ? document.getElementById("audio-modal-root") : null;
          const rect = audioEl ? audioEl.getBoundingClientRect() : null;
          setUploadSuccessAnchor(rect);
          setTimeout(() => setIsUploadSuccessOpen(true), 20);
        }}
      />

      {/* Upload success modal */}
      <UploadSuccessModal
        open={isUploadSuccessOpen}
        onClose={() => setIsUploadSuccessOpen(false)}
        anchorRect={uploadSuccessAnchor}
      />

      {/* Go Live Modal */}
      <GoLiveModal
        open={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        onStartLive={(roomInfo) => {
          setIsGoLiveOpen(false);
          if (roomInfo) {
            setLiveRoomInfo(roomInfo);
          }
          setIsAudioOpen(true);
        }}
      />

      {/* Audio / Live room bottom modal */}
      <AudioModal 
        open={isAudioOpen} 
        onClose={() => {
          setIsAudioOpen(false);
          setLiveRoomInfo(null);
        }} 
        participantsCount={0}
        roomId={liveRoomInfo?.roomId}
        liveStreamId={liveRoomInfo?.liveStreamId}
        topic={liveRoomInfo?.topic}
      />

      {/* Microphone settings modal */}
      <MicrophoneSettingsModal open={isMicSettingsOpen} onClose={() => setIsMicSettingsOpen(false)} />

      {/* PDF Viewer Modal for Khotba Documents */}
      <PDFViewerModal
        isOpen={isPDFViewerOpen}
        onClose={() => {
          setIsPDFViewerOpen(false);
          setSelectedKhotbaDoc(null);
        }}
        documentId={selectedKhotbaDoc?.id || ""}
        documentTitle={selectedKhotbaDoc?.title}
        documentDate={selectedKhotbaDoc?.date}
      />
    </div>
  );
}
