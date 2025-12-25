/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Moon, MessageCircle, Download, FileText, AlignLeft, AlignCenter, AlignRight, Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";
import dynamic from "next/dynamic";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import StartNewMessage from "../../user/start_new_message";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Hijri date conversion utilities
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Simple Gregorian to Hijri conversion (approximate)
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type CalendarDay = {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  hijri: { year: number; month: number; day: number };
};

function buildMonthMatrix(year: number, month: number): CalendarDay[][] {
  const first = new Date(year, month, 1);
  const startWeekDay = first.getDay();
  const startDate = new Date(first);
  startDate.setDate(first.getDate() - startWeekDay);

  const matrix: CalendarDay[][] = [];
  const cur = new Date(startDate);
  const today = new Date();
  const todayISO = toISODate(today);

  for (let week = 0; week < 6; week++) {
    const row: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      const iso = toISODate(cur);
      row.push({
        date: new Date(cur),
        iso,
        inCurrentMonth: cur.getMonth() === month,
        isToday: iso === todayISO,
        hijri: gregorianToHijri(cur),
      });
      cur.setDate(cur.getDate() + 1);
    }
    matrix.push(row);
  }
  return matrix;
}

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
              <img
                src="/icons/settings/profile.png"
                alt="Profile"
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
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
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploadSuccessOpen, setUploadSuccessOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [isStartNewOpen, setStartNewOpen] = useState(false);

  const [khotbaTitle, setKhotbaTitle] = useState("");
  const [khotbaContent, setKhotbaContent] = useState("");
  const [importance, setImportance] = useState("");
  const [supportingData, setSupportingData] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('right');
  const [fontSize, setFontSize] = useState(16);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Calendar state
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [selectedKhotbaDate, setSelectedKhotbaDate] = useState<Date | null>(date ? new Date(date) : null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Document selection state
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentMode, setDocumentMode] = useState<'upload' | 'previous'>('upload');
  const [previousDocuments, setPreviousDocuments] = useState<any[]>([]);
  const [selectedPreviousDoc, setSelectedPreviousDoc] = useState<any | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const dummyUsers = [
    { id: "u1", name: "John Doe", avatar: "https://i.pravatar.cc/80?img=1" },
    { id: "u2", name: "Jane Smith", avatar: "https://i.pravatar.cc/80?img=2" },
  ];

  // Calendar matrix
  const calendarMatrix = useMemo(() => buildMonthMatrix(calendarYear, calendarMonth), [calendarYear, calendarMonth]);

  // Get Hijri date for selected date
  const selectedHijri = useMemo(() => {
    if (!selectedKhotbaDate) return null;
    return gregorianToHijri(selectedKhotbaDate);
  }, [selectedKhotbaDate]);

  // Calendar navigation
  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(y => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(y => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  // Fetch previous documents from API
  const fetchPreviousDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const userId = localStorage.getItem('user_id');
      const accessToken = localStorage.getItem('access_token');
      
      if (!userId) {
        alert('User not authenticated. Please log in.');
        setIsLoadingDocs(false);
        return;
      }

      console.log('Fetching documents for user:', userId);

      const response = await fetch(`/api/documents/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Documents data:', data);
        // Handle different response formats
        const docs = Array.isArray(data) ? data : (data.documents || data.data || []);
        setPreviousDocuments(docs);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch documents:', errorData);
        setPreviousDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setPreviousDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Open document selection modal
  const openDocumentModal = () => {
    setDocumentModalOpen(true);
    setDocumentMode('previous'); // Default to previous documents tab
    fetchPreviousDocuments();
  };

  // Select a previous document
  const selectPreviousDocument = (doc: any) => {
    setSelectedPreviousDoc(doc);
    setUploadedDocuments([doc]);
    setDocumentModalOpen(false);
  };

  // Check if date is in the future (tomorrow or later)
  const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate >= tomorrow;
  };

  // Schedule khotba with selected date
  const scheduleKhotba = async () => {
    if (!selectedKhotbaDate) {
      alert('Please select a future date first.');
      return;
    }

    if (!isFutureDate(selectedKhotbaDate)) {
      alert('Please select a future date (tomorrow or later).');
      return;
    }

    if (uploadedDocuments.length === 0) {
      alert('Please upload a document first.');
      return;
    }

    setIsScheduling(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      const documentId = uploadedDocuments[uploadedDocuments.length - 1]?.id;

      if (!documentId) {
        alert('No document ID found. Please upload a document first.');
        setIsScheduling(false);
        return;
      }

      // Set time to 12:00 PM for the selected date
      const scheduleDate = new Date(selectedKhotbaDate);
      scheduleDate.setHours(12, 0, 0, 0);
      
      // Format date as ISO string: 2025-10-23T12:00:00.000
      const airTime = scheduleDate.toISOString().slice(0, -1); // Remove 'Z' at the end

      console.log('Scheduling khotba:', {
        documentId,
        airTime,
        selectedDate: selectedKhotbaDate.toISOString(),
      });

      const response = await fetch('/api/documents/airtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          documentId,
          airTime,
        }),
      });

      const responseData = await response.json();
      console.log('Schedule response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to schedule khotba');
      }

      setScheduleSuccess(true);
      setTimeout(() => {
        setScheduleSuccess(false);
        setCalendarOpen(false);
      }, 2000);

      // Store scheduled date in localStorage for the Schedule page
      const scheduledKhotbas = JSON.parse(localStorage.getItem('scheduled_khotbas') || '{}');
      const isoDate = toISODate(selectedKhotbaDate);
      scheduledKhotbas[isoDate] = [
        ...(scheduledKhotbas[isoDate] || []),
        {
          id: documentId,
          title: khotbaTitle || 'Scheduled Khotba / خطبة مجدولة',
          airTime,
          color: 'bg-green-500',
          isKhotba: true,
        }
      ];
      localStorage.setItem('scheduled_khotbas', JSON.stringify(scheduledKhotbas));
      
      // Dispatch custom event to notify other components (like the Calendar in khateb_Studio)
      window.dispatchEvent(new CustomEvent('khotba-scheduled', { 
        detail: { isoDate, documentId, title: khotbaTitle } 
      }));

    } catch (error) {
      console.error('Error scheduling khotba:', error);
      alert(`Failed to schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScheduling(false);
    }
  };

  // Check if user is a preacher
  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const userStr = localStorage.getItem('user');
        const userRole = localStorage.getItem('user_role');
        
        let role = userRole;
        
        // Try to get role from user object if stored
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            role = user.role || userRole;
          } catch {
            // ignore parse error
          }
        }
        
        console.log('User role:', role);
        
        if (role !== 'preacher') {
          // Not a preacher, redirect to home
          alert('Access denied. Only preachers can access this page.');
          router.push('/user');
          return;
        }
        
        setIsAuthorized(true);
      } catch (err) {
        console.error('Error checking authorization:', err);
        router.push('/user');
      }
    };
    
    checkAuthorization();
  }, [router]);

  // File size validation (in bytes)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File "${file.name}" has unsupported format. Allowed formats: PDF, DOC, DOCX, TXT`;
    }

    return null; // File is valid
  };

  const handleAddFile = () => {
    setUploadModalOpen(true);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Validate all files first
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      // Show validation errors if any
      if (validationErrors.length > 0) {
        alert(`Upload failed:\n\n${validationErrors.join('\n\n')}`);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // If no valid files, return
      if (validFiles.length === 0) {
        return;
      }

      setIsUploading(true);
      
      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem('user_id');
        const accessToken = localStorage.getItem('access_token');
        
        console.log('User ID:', userId);
        console.log('Has access token:', !!accessToken);
        
        if (!userId) {
          alert('User not authenticated. Please log in.');
          setIsUploading(false);
          return;
        }

        // Upload each valid file and collect results
        const uploadResults: any[] = [];
        for (const file of validFiles) {
          console.log('Uploading file:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(1)}MB`);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', userId);

          const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: formData,
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            const responseText = await response.text();
            console.error('Upload failed - Status:', response.status);
            console.error('Upload failed - Response text:', responseText);
            
            let error;
            try {
              error = JSON.parse(responseText);
            } catch {
              error = { error: responseText || `HTTP ${response.status}` };
            }
            
            console.error('Upload failed - Parsed error:', error);
            
            // Handle specific error types
            let errorMsg = 'Upload failed';
            if (error.details) {
              try {
                const details = JSON.parse(error.details);
                if (details.message?.includes('Maximum upload size exceeded')) {
                  errorMsg = `File "${file.name}" exceeds server upload limit. Please use a smaller file (under 10MB).`;
                } else {
                  errorMsg = details.message || error.details;
                }
              } catch {
                errorMsg = error.details;
              }
            } else if (error.error) {
              errorMsg = error.error;
            } else if (error.message) {
              errorMsg = error.message;
            }
            
            throw new Error(errorMsg);
          }

          const result = await response.json();
          console.log('Upload success:', result);
          uploadResults.push(result);
        }
        
        // Add files to local state after successful upload
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setUploadedDocuments(prev => [...prev, ...uploadResults]);
        setIsUploading(false);
        setUploadSuccessOpen(true);
        
        setTimeout(() => {
          setUploadSuccessOpen(false);
          setUploadModalOpen(false);
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);
        setIsUploading(false);
        alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    
    if (files && files.length) {
      // Validate all files first
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      // Show validation errors if any
      if (validationErrors.length > 0) {
        alert(`Upload failed:\n\n${validationErrors.join('\n\n')}`);
        return;
      }

      // If no valid files, return
      if (validFiles.length === 0) {
        return;
      }

      setIsUploading(true);
      
      try {
        const userId = localStorage.getItem('user_id');
        const accessToken = localStorage.getItem('access_token');
        
        if (!userId) {
          alert('User not authenticated. Please log in.');
          setIsUploading(false);
          return;
        }

        // Upload each valid file and collect results
        const uploadResults: any[] = [];
        for (const file of validFiles) {
          console.log('Uploading file:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(1)}MB`);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', userId);

          const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: formData,
          });

          if (!response.ok) {
            const responseText = await response.text();
            let error;
            try {
              error = JSON.parse(responseText);
            } catch {
              error = { error: responseText || `HTTP ${response.status}` };
            }
            
            // Handle specific error types
            let errorMsg = 'Upload failed';
            if (error.details) {
              try {
                const details = JSON.parse(error.details);
                if (details.message?.includes('Maximum upload size exceeded')) {
                  errorMsg = `File "${file.name}" exceeds server upload limit. Please use a smaller file (under 10MB).`;
                } else {
                  errorMsg = details.message || error.details;
                }
              } catch {
                errorMsg = error.details;
              }
            } else if (error.error) {
              errorMsg = error.error;
            } else if (error.message) {
              errorMsg = error.message;
            }
            
            throw new Error(errorMsg);
          }

          const result = await response.json();
          console.log('Upload success:', result);
          uploadResults.push(result);
        }
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setUploadedDocuments(prev => [...prev, ...uploadResults]);
        setIsUploading(false);
        setUploadSuccessOpen(true);
        
        setTimeout(() => {
          setUploadSuccessOpen(false);
          setUploadModalOpen(false);
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);
        setIsUploading(false);
        alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
  
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const handleSelectUser = (user: any) => {
    console.log("Selected user:", user);
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.padding = '20mm';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.direction = 'rtl';
      
      tempContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #8A1538; padding-bottom: 20px;">
          <h1 style="color: #8A1538; font-size: 32px; margin-bottom: 10px; font-weight: bold;">خطبة الجمعة</h1>
          <p style="color: #666; font-size: 16px;">${formattedDate || new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #8A1538; font-size: 24px; margin-bottom: 15px; font-weight: bold; text-align: ${textAlign};">موضوع الخطبة</h2>
          <p style="font-size: ${fontSize}px; line-height: 1.8; color: #333; text-align: ${textAlign};">${khotbaTitle || 'لم يتم إدخال عنوان'}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #8A1538; font-size: 24px; margin-bottom: 15px; font-weight: bold; text-align: ${textAlign};">محتوى الخطبة</h2>
          <div style="font-size: ${fontSize}px; line-height: 1.8; color: #333; white-space: pre-wrap; text-align: ${textAlign};">${khotbaContent || 'لم يتم إدخال محتوى'}</div>
        </div>
        
        ${importance ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #8A1538; font-size: 24px; margin-bottom: 15px; font-weight: bold; text-align: ${textAlign};">الأهمية</h2>
          <div style="font-size: ${fontSize}px; line-height: 1.8; color: #333; white-space: pre-wrap; text-align: ${textAlign};">${importance}</div>
        </div>
        ` : ''}
        
        ${supportingData ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #8A1538; font-size: 24px; margin-bottom: 15px; font-weight: bold; text-align: ${textAlign};">البيانات الداعمة</h2>
          <div style="font-size: ${fontSize}px; line-height: 1.8; color: #333; white-space: pre-wrap; text-align: ${textAlign};">${supportingData}</div>
        </div>
        ` : ''}
        
        ${selectedFiles.length > 0 ? `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee;">
          <h3 style="color: #8A1538; font-size: 18px; margin-bottom: 10px; font-weight: bold;">الملفات المرفقة:</h3>
          <ul style="list-style: none; padding: 0;">
            ${selectedFiles.map(file => `<li style="margin-bottom: 5px; color: #666;">• ${file.name}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div style="margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>تم إنشاء هذا المستند بواسطة نظام إعداد الخطب - وصال</p>
        </div>
      `;
      
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      
      const fileName = `خطبة_${khotbaTitle.substring(0, 20) || 'جديدة'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert('تم تصدير الخطبة بنجاح! ✓');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading while checking authorization
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin w-12 h-12 text-[#8A1538] mb-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
          </svg>
          <p className="text-gray-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} onOpenMessages={() => setMessagesOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-24 px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="text-base text-[#8A1538] flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-base text-[#8A1538] hover:underline">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" /></svg>
                <span>Back to Home</span>
              </button>
              <Link href="/Schedual/previous_khotbas" className="flex items-center gap-2 text-base text-gray-500 hover:text-[#8A1538] transition-colors">
                <FileText className="w-5 h-5" />
                <span>Previous Khotbas</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Set Khotba Button */}
              <button 
                onClick={() => {
                  if (uploadedDocuments.length === 0 && !selectedPreviousDoc) {
                    // Open document selection modal first
                    openDocumentModal();
                  } else if (!selectedKhotbaDate) {
                    setCalendarOpen(true);
                  } else if (!isFutureDate(selectedKhotbaDate)) {
                    alert('Please select a future date (tomorrow or later).');
                    setCalendarOpen(true);
                  } else {
                    scheduleKhotba();
                  }
                }}
                disabled={isScheduling}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScheduling ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    <span>Setting...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Set Khotba</span>
                  </>
                )}
              </button>

              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export as PDF</span>
                  </>
                )}
              </button>

              <button onClick={handleAddFile} className="flex items-center gap-2 text-base text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-1">Add file</span>
              </button>

              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleFileChange} multiple style={{ display: "none" }} />
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Text Alignment:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-2 rounded ${textAlign === 'left' ? 'bg-[#8A1538] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`p-2 rounded ${textAlign === 'center' ? 'bg-[#8A1538] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`p-2 rounded ${textAlign === 'right' ? 'bg-[#8A1538] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    title="Align Right (Arabic)"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Font Size:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-700"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                  <option value={24}>24px</option>
                  <option value={28}>28px</option>
                  <option value={32}>32px</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Characters: {khotbaContent.length}</span>
              </div>
            </div>
          </div>

          <div ref={contentRef} className="mb-12">
            <div className="text-base text-gray-300 uppercase tracking-wide">khotbah subject</div>
            <input
              type="text"
              value={khotbaTitle}
              onChange={(e) => setKhotbaTitle(e.target.value)}
              placeholder="Enter Khotba title / أدخل عنوان الخطبة"
              className="mt-4 w-full text-5xl font-semibold text-[#2b2b2b] bg-transparent border-none focus:outline-none focus:ring-0"
              style={{ textAlign: textAlign }}
            />
            
            {/* Date Selection Section */}
            <div className="mt-6 p-4 bg-[#fff8f0] rounded-lg border border-[#f5e8dc]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Calendar className="w-6 h-6 text-[#8A1538]" />
                  <div>
                    <div className="text-sm text-gray-500">Khotba Date / تاريخ الخطبة</div>
                    {selectedKhotbaDate ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-lg font-semibold text-gray-800">
                          {selectedKhotbaDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {selectedHijri && (
                          <div className="text-base text-[#8A1538] font-medium" dir="rtl">
                            {selectedHijri.day} {HIJRI_MONTHS_AR[selectedHijri.month - 1]} {selectedHijri.year} هـ
                          </div>
                        )}
                        {selectedKhotbaDate && !isFutureDate(selectedKhotbaDate) && (
                          <div className="text-sm text-red-600 font-medium">
                            ⚠️ Please select a future date (tomorrow or later)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400">No date selected / لم يتم اختيار تاريخ</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCalendarOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#8A1538] text-[#8A1538] rounded-lg hover:bg-[#fff0f0] transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{selectedKhotbaDate ? 'Change Date' : 'Select Date'}</span>
                  </button>
                  {selectedKhotbaDate && uploadedDocuments.length > 0 && isFutureDate(selectedKhotbaDate) && (
                    <button
                      onClick={scheduleKhotba}
                      disabled={isScheduling}
                      className="flex items-center gap-2 px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50"
                    >
                      {isScheduling ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                          </svg>
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Schedule Khotba</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Select a future date to schedule your khotba (tomorrow or later)</span>
                </div>
                {uploadedDocuments.length === 0 && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600">
                    <span>📄</span>
                    <span>Upload a document first to enable scheduling</span>
                  </div>
                )}
              </div>
            </div>
            
            {formattedDate && !selectedKhotbaDate && (
              <div className="mt-4 text-base text-gray-600">Selected date: <span className="font-medium text-gray-800">{formattedDate}</span></div>
            )}
          </div>

          <div className="mb-10">
            <textarea
              value={khotbaContent}
              onChange={(e) => setKhotbaContent(e.target.value)}
              placeholder="Write your Khotba content here... / اكتب محتوى الخطبة هنا..."
              className="w-full min-h-[400px] border-t border-b border-gray-200 px-6 py-8 text-lg text-gray-700 focus:outline-none resize-y"
              style={{ 
                textAlign: textAlign, 
                fontSize: `${fontSize}px`,
                lineHeight: '1.8',
                direction: textAlign === 'right' ? 'rtl' : 'ltr'
              }}
            />
          </div>
          
          <hr className="border-t border-gray-200 my-10" />

          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Why do you think it&apos;s important?</h2>
            <textarea
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              placeholder="Explain the importance... / اشرح الأهمية..."
              className="w-full min-h-[200px] border border-gray-200 rounded-lg px-6 py-4 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A1538] resize-y"
              style={{ 
                textAlign: textAlign, 
                fontSize: `${fontSize}px`,
                lineHeight: '1.8',
                direction: textAlign === 'right' ? 'rtl' : 'ltr'
              }}
            />
          </div>

          <hr className="border-t border-gray-200 my-10" />

          <div className="mb-20">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Supporting data</h3>
            <textarea
              value={supportingData}
              onChange={(e) => setSupportingData(e.target.value)}
              placeholder="Add supporting data, references, or links... / أضف البيانات الداعمة والمراجع..."
              className="w-full min-h-[150px] border border-gray-200 rounded-lg px-6 py-4 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A1538] resize-y mb-6"
              style={{ 
                textAlign: textAlign, 
                fontSize: `${fontSize}px`,
                lineHeight: '1.8',
                direction: textAlign === 'right' ? 'rtl' : 'ltr'
              }}
            />
            
            {selectedFiles.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Attached Files:</h4>
                <ul className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#8A1538]" />
                        <span className="text-gray-700">{file.name}</span>
                        <span className="text-sm text-gray-500">
                          ({file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`})
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setUploadModalOpen(false)} />
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative z-10 w-[640px] h-[444px] p-6 bg-[#FFF9F3] rounded-[24px] flex flex-col items-center justify-center gap-6 ${dragOver ? "ring-2 ring-[#8A1538]" : ""}`}
          >
            <div className="flex flex-col items-center gap-[26px]">
              <div className="w-14 h-14 flex items-center justify-center">
                <Image
                  src="/figma-assets/upload-icon.svg"
                  alt="Upload"
                  width={56}
                  height={56}
                />
              </div>
              
              <div className="flex flex-col items-center justify-center gap-4 w-full">
                <h2 className="text-[32px] font-medium text-[#333333] text-center leading-[1em] tracking-[-0.04em]">
                  Drag and drop file to upload
                </h2>
                <div className="text-center text-gray-600">
                  <div className="text-sm mb-2">Supported formats: PDF, DOC, DOCX, TXT</div>
                  <div className="text-sm">Maximum file size: 10MB</div>
                </div>
              </div>
            </div>

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

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCalendarOpen(false)} />
          <div className="relative z-10 w-[700px] bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-[#8A1538] text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Select Khotba Date / اختر تاريخ الخطبة</h2>
                <button onClick={() => setCalendarOpen(false)} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedKhotbaDate && selectedHijri && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg">{selectedKhotbaDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-white/80">{WEEKDAYS_EN[selectedKhotbaDate.getDay()]}</div>
                  </div>
                  <div className="text-right" dir="rtl">
                    <div className="text-lg">{selectedHijri.day} {HIJRI_MONTHS_AR[selectedHijri.month - 1]} {selectedHijri.year} هـ</div>
                    <div className="text-white/80">{WEEKDAYS_AR[selectedKhotbaDate.getDay()]}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="text-sm text-[#8A1538]" dir="rtl">
                  {HIJRI_MONTHS_AR[gregorianToHijri(new Date(calendarYear, calendarMonth, 15)).month - 1]} {gregorianToHijri(new Date(calendarYear, calendarMonth, 15)).year} هـ
                </div>
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b">
              {WEEKDAYS_EN.map((day, i) => (
                <div key={day} className="py-3 text-center">
                  <div className="text-sm font-medium text-gray-600">{day}</div>
                  <div className="text-xs text-[#8A1538]" dir="rtl">{WEEKDAYS_AR[i]}</div>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {calendarMatrix.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-1">
                  {week.map((day) => {
                    const isSelected = selectedKhotbaDate && toISODate(selectedKhotbaDate) === day.iso;
                    const isFriday = day.date.getDay() === 5;
                    const isPastDate = !isFutureDate(day.date);
                    const isDisabled = isPastDate || !day.inCurrentMonth;
                    
                    return (
                      <button
                        key={day.iso}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedKhotbaDate(day.date);
                          }
                        }}
                        disabled={isDisabled}
                        className={`
                          p-2 rounded-lg text-center transition-all min-h-[70px] flex flex-col items-center justify-center
                          ${!day.inCurrentMonth ? 'opacity-40' : ''}
                          ${isPastDate ? 'opacity-30 cursor-not-allowed bg-gray-100' : ''}
                          ${isSelected ? 'bg-[#8A1538] text-white' : day.isToday ? 'bg-[#fff0f0] border-2 border-[#8A1538] opacity-50' : !isDisabled ? 'hover:bg-gray-100' : ''}
                          ${isFriday && !isSelected && !isPastDate ? 'bg-green-50' : ''}
                          ${!isPastDate && day.inCurrentMonth ? 'cursor-pointer' : ''}
                        `}
                      >
                        <div className={`text-lg font-medium ${isSelected ? 'text-white' : day.isToday ? 'text-[#8A1538]' : isPastDate ? 'text-gray-400' : ''}`}>
                          {day.date.getDate()}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-white/80' : isPastDate ? 'text-gray-300' : 'text-[#8A1538]'}`} dir="rtl">
                          {day.hijri.day}
                        </div>
                        {isFriday && (
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : isPastDate ? 'text-gray-300' : 'text-green-600'}`}>
                            الجمعة
                          </div>
                        )}
                        {isPastDate && day.inCurrentMonth && (
                          <div className="text-[8px] text-gray-400 mt-0.5">Past</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Calendar Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                  <span>Friday / الجمعة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#fff0f0] border-2 border-[#8A1538] rounded opacity-50"></div>
                  <span>Today (Past) / اليوم</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded opacity-50"></div>
                  <span>Past Dates / تواريخ سابقة</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setCalendarOpen(false)}
                  disabled={!selectedKhotbaDate || !isFutureDate(selectedKhotbaDate)}
                  className="px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Success Modal */}
      {scheduleSuccess && (
        <div className="fixed inset-0 z-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-20 w-[400px] p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-gray-800">Khotba Scheduled!</div>
            <div className="text-gray-600 text-center">
              Your khotba has been scheduled for<br />
              <span className="font-medium text-[#8A1538]">
                {selectedKhotbaDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Document Selection Modal */}
      {isDocumentModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDocumentModalOpen(false)} />
          <div className="relative z-10 w-[700px] max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#8A1538] text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Select Document / اختر المستند</h2>
                <button onClick={() => setDocumentModalOpen(false)} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/80 mt-2">Choose to upload a new document or select from your previous uploads</p>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => {
                  setDocumentMode('previous');
                  fetchPreviousDocuments();
                }}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  documentMode === 'previous' 
                    ? 'bg-[#fff8f0] text-[#8A1538] border-b-2 border-[#8A1538]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Previous Documents / المستندات السابقة</span>
                </div>
              </button>
              <button
                onClick={() => setDocumentMode('upload')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  documentMode === 'upload' 
                    ? 'bg-[#fff8f0] text-[#8A1538] border-b-2 border-[#8A1538]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload New / رفع جديد</span>
                </div>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {documentMode === 'previous' ? (
                /* Previous Documents List */
                <div>
                  {isLoadingDocs ? (
                    <div className="flex items-center justify-center py-12">
                      <svg className="animate-spin w-8 h-8 text-[#8A1538]" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      <span className="ml-3 text-gray-600">Loading documents...</span>
                    </div>
                  ) : previousDocuments.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No previous documents / لا توجد مستندات سابقة</h3>
                      <p className="text-gray-500">Upload a new document to get started</p>
                      <button
                        onClick={() => setDocumentMode('upload')}
                        className="mt-4 px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029]"
                      >
                        Upload New Document
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500 mb-4">
                        Found {previousDocuments.length} document(s) - Select one to schedule
                      </div>
                      {previousDocuments.map((doc: any) => (
                        <button
                          key={doc.id}
                          onClick={() => selectPreviousDocument(doc)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-[#8A1538] hover:bg-[#fff8f0] ${
                            selectedPreviousDoc?.id === doc.id 
                              ? 'border-[#8A1538] bg-[#fff8f0]' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">
                                {doc.originalName || doc.fileName || `Document ${doc.id}`}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                {doc.uploadedAt && (
                                  <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                )}
                                {doc.airTime && (
                                  <span className="text-green-600">Scheduled: {new Date(doc.airTime).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            {selectedPreviousDoc?.id === doc.id && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Upload New Document */
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragOver ? 'border-[#8A1538] bg-[#fff8f0]' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">Drag and drop file to upload</h3>
                      <p className="text-gray-500 mb-1">Supported formats: PDF, DOC, DOCX, TXT</p>
                      <p className="text-gray-500">Maximum file size: 10MB</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedPreviousDoc ? (
                  <span className="text-green-600 font-medium">
                    ✓ Selected: {selectedPreviousDoc.originalName || selectedPreviousDoc.fileName || `Document ${selectedPreviousDoc.id}`}
                  </span>
                ) : uploadedDocuments.length > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ {uploadedDocuments.length} document(s) ready
                  </span>
                ) : (
                  <span>Select or upload a document to continue</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDocumentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDocumentModalOpen(false);
                    if (uploadedDocuments.length > 0 || selectedPreviousDoc) {
                      setCalendarOpen(true);
                    }
                  }}
                  disabled={uploadedDocuments.length === 0 && !selectedPreviousDoc}
                  className="px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Date Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button aria-label="Open messages" onClick={() => setMessagesOpen(true)} className="fixed bottom-8 right-8 bg-[#8A1538] text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-[#6d1029] transition-colors text-lg">
        <span className="font-medium">Messages</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>

      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setMessagesOpen(false)}
        onOpenStart={() => setStartNewOpen(true)}
      />

      <StartNewMessage
        isOpen={isStartNewOpen}
        onClose={() => setStartNewOpen(false)}
        users={dummyUsers}
        onSelect={handleSelectUser}
      />
    </div>
  );
}
