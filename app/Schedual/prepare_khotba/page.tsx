/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Moon, MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import StartNewMessage from "../../user/start_new_message";

function NavBar({
  onToggleSidebar,
  isSidebarOpen,
  onOpenMessages,
}: {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenMessages?: () => void;
}) {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isAskOpen, setAskOpen] = useState(false);

  const NotificationPanel = dynamic(() => import("../../user/notification"), { ssr: false });
  const ProfileModal = dynamic(() => import("../../user/profile_modal"), { ssr: false });
  const AskImamModal = dynamic(() => import("../../user/askimam"), { ssr: false });
  const SheikhModal = dynamic(() => import("../../user/sheikh_modal"), { ssr: false });

  const toggleTheme = () => {
    try {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (e) {
      // ignore
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fff6f3] border-b border-[#f0e6e5]">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => onToggleSidebar?.()}
              aria-expanded={!!isSidebarOpen}
              className="p-3 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/app/user" className="block w-12 h-12 relative">
              <Image
                src="/figma-assets/logo_wesal.png"
                alt="WESAL"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-6 max-w-2xl mx-auto">
            <div className="w-full">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="w-full h-11 rounded-full pl-12 pr-12 bg-gray-50 text-base text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:ring-0"
                />
                <button
                  aria-hidden
                  className="absolute inset-y-0 right-2 flex items-center px-3 text-gray-400"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2 flex-shrink-0 relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#f0e6e5] bg-[#fff6f3] text-[#7b2030] text-sm font-medium hover:bg-gray-50"
              onClick={() => setAskOpen(true)}
            >
              <span>Ask Imam ?</span>
            </button>

            <button
              aria-label="Toggle theme"
              className="p-3 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={toggleTheme}
            >
              <Moon className="w-6 h-6" />
            </button>

            <button aria-label="Messages" className="p-3 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => onOpenMessages?.()}
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((s) => !s)}
              className="relative p-3 rounded-full text-gray-600 hover:bg-gray-100"
              type="button"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-[7px] py-[2px] text-[11px] font-semibold leading-none text-white bg-[#ff6b6b] rounded-full">3</span>
            </button>

            <div className="absolute right-0 top-14 z-50">
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="ml-2 w-10 h-10 rounded-full overflow-hidden relative shadow-sm ring-1 ring-[#f0e6e5]"
              aria-label="Open profile"
            >
              <Image
                src="/icons/settings/profile.png"
                alt="Profile"
                fill
                style={{ objectFit: "cover" }}
              />
            </button>

            <div className="absolute right-0 top-14 z-50">
              <ProfileModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
            </div>
          </nav>
        </div>
      </div>

      <AskImamModal isOpen={isAskOpen} onClose={() => setAskOpen(false)} />
      <SheikhModal />
    </header>
  );
}

export default function PrepareKhotbaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams?.get("date") ?? "";
  const formattedDate = date ? new Date(date).toLocaleDateString() : "";

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // upload modal + success modal state
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploadSuccessOpen, setUploadSuccessOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [isStartNewOpen, setStartNewOpen] = useState(false);

  // dummy users for start new message
  const dummyUsers = [
    { id: "u1", name: "John Doe", avatar: "https://i.pravatar.cc/80?img=1" },
    { id: "u2", name: "Jane Smith", avatar: "https://i.pravatar.cc/80?img=2" },
    // add more as needed
  ];

  // open upload modal (previously the Add file button triggered file input directly)
  const handleAddFile = () => {
    setUploadModalOpen(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
      // simulate upload with uploading indicator
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccessOpen(true);
        setTimeout(() => {
          setUploadSuccessOpen(false);
          setUploadModalOpen(false);
        }, 2000);
      }, 1500); // simulate 1.5s upload
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
      // simulate upload with uploading indicator
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccessOpen(true);
        setTimeout(() => {
          setUploadSuccessOpen(false);
          setUploadModalOpen(false);
        }, 2000);
      }, 1500);
    }
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const handleUploadConfirm = () => {
    if (selectedFiles.length === 0) return;
    // simulate upload...
    setUploadSuccessOpen(true);
    // auto-close success after 2s
    setTimeout(() => {
      setUploadSuccessOpen(false);
      setUploadModalOpen(false);
      // optionally clear selection: setSelectedFiles([]);
    }, 2000);
  };

  const handleSelectUser = (user: any) => {
    // handle selecting user, e.g., open chat
    console.log("Selected user:", user);
    // for now, just close
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} onOpenMessages={() => setMessagesOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-24 px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="text-base text-[#8A1538] flex items-center gap-2">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-base text-[#8A1538] hover:underline">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Back to Home</span>
              </button>
            </div>

            <div className="text-base text-gray-500">
              <button onClick={handleAddFile} className="flex items-center gap-2 text-base text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-1">Add file</span>
              </button>

              {/* hidden native input used by the modal's "Select File" button */}
              <input ref={fileInputRef} type="file" onChange={handleFileChange} multiple style={{ display: "none" }} />
            </div>
          </div>

          <div className="mb-12">
            <div className="text-base text-gray-300 uppercase tracking-wide">khotbah subject</div>
            <h1 className="mt-4 text-5xl font-semibold text-[#2b2b2b]">Describe your idea</h1>
            {formattedDate ? (
              <div className="mt-4 text-base text-gray-600">Selected date: <span className="font-medium text-gray-800">{formattedDate}</span></div>
            ) : (
              <p className="mt-4 text-base text-gray-500">Provide a 2-3 sentence description.</p>
            )}
          </div>

          {/* large textarea / content area */}
          <div className="mb-10">
            <textarea
              placeholder="Write here what you think..."
              className="w-full min-h-[300px] border-t border-b border-gray-200 px-6 py-8 text-lg text-gray-700 focus:outline-none"
            />
          </div>
          
          <hr className="border-t border-gray-200 my-10" />

          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Why do you think it&apos;s important?</h2>
            <p className="text-lg text-gray-500 mb-4">Why do you think it&apos;s important?</p>
            <ul className="list-disc list-inside text-lg text-gray-600 space-y-3">
              <li>List</li>
              <li>List</li>
              <li>List</li>
            </ul>
          </div>

          <hr className="border-t border-gray-200 my-10" />

          <div className="mb-20">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Supporting data</h3>
            <p className="text-lg text-gray-500">Link slack threads, data reports, etc.</p>
            <div className="mt-6 border border-dashed border-gray-200 rounded p-8 min-h-[150px] text-lg text-gray-400">
              {selectedFiles.length > 0 ? (
                <ul className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span>{file.name}</span>
                      <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                "Attach supporting files or paste links here..."
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setUploadModalOpen(false)} />
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative z-10 w-[640px] h-[444px] p-6 bg-[#FFF9F3] rounded-[24px] flex flex-col items-center justify-center gap-6 ${dragOver ? "ring-2 ring-[#8A1538]" : ""}`}
          >
            {/* Upload Icon */}
            <div className="flex flex-col items-center gap-[26px]">
              <div className="w-14 h-14 flex items-center justify-center">
                <Image
                  src="/figma-assets/upload-icon.svg"
                  alt="Upload"
                  width={56}
                  height={56}
                />
              </div>
              
              {/* Title */}
              <div className="flex flex-col items-center justify-center gap-4 w-full">
                <h2 className="text-[32px] font-medium text-[#333333] text-center leading-[1em] tracking-[-0.04em]">
                  Drag and drop file to upload
                </h2>
              </div>
            </div>

            {/* Select File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-[166px] h-12 bg-[#8A1538] rounded-lg flex items-center justify-center gap-2 px-4 py-2 hover:bg-[#6d1029] transition-colors"
            >
              <span className="text-white text-lg font-medium leading-[1em] tracking-[-0.04em]">
                Select File
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Success / Uploading indicator */}
      {isUploadModalOpen && isUploading && (
        <div className="fixed inset-0 z-70 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-20 w-[320px] p-6 bg-white rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-[#8A1538]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
            </div>
            <div className="text-base font-medium text-[#2F2F2F]">Uploading...</div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-[#8A1538] animate-progress" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {isUploadSuccessOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-20 w-[640px] h-[444px] p-8 bg-[#FFF9F3] rounded-[24px] flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-4 w-[442px]">
              <div className="w-[150px] h-[150px]">
                <Image src="/figma-assets/success-image.png" alt="success" width={150} height={150} />
              </div>
              <div className="text-[18px] font-bold text-[#2F2F2F] text-center">Upload Complete!</div>
              <div className="text-[16px] text-[#6F6F6F] text-center">Great! Your file was uploaded successfully. You can now access it from your dashboard.</div>
              <button onClick={() => { setUploadSuccessOpen(false); }} className="mt-4 w-[166px] h-12 bg-[#8A1538] rounded-lg flex items-center justify-center text-white font-medium">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating messages button */}
      <button aria-label="Open messages" onClick={() => setMessagesOpen(true)} className="fixed bottom-8 right-8 bg-[#8A1538] text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-[#6d1029] transition-colors text-lg">
        <span className="font-medium">Messages</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setMessagesOpen(false)}
        onOpenStart={() => setStartNewOpen(true)}
      />

      {/* Start New Message Modal */}
      <StartNewMessage
        isOpen={isStartNewOpen}
        onClose={() => setStartNewOpen(false)}
        users={dummyUsers}
        onSelect={handleSelectUser}
      />
    </div>
  );
}