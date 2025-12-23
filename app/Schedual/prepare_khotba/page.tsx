/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Moon, MessageCircle, Download, FileText, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import dynamic from "next/dynamic";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import StartNewMessage from "../../user/start_new_message";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const dummyUsers = [
    { id: "u1", name: "John Doe", avatar: "https://i.pravatar.cc/80?img=1" },
    { id: "u2", name: "Jane Smith", avatar: "https://i.pravatar.cc/80?img=2" },
  ];

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

  const handleAddFile = () => {
    setUploadModalOpen(true);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
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

        // Upload each file
        const uploadPromises = Array.from(files).map(async (file) => {
          console.log('Uploading file:', file.name, file.type, file.size);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', userId);
          // Optional: Add liveStreamId if needed
          // formData.append('liveStreamId', 'your-stream-id');

          const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: formData,
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            // Try to get response as text first
            const responseText = await response.text();
            console.error('Upload failed - Status:', response.status);
            console.error('Upload failed - Response text:', responseText);
            
            // Try to parse as JSON
            let error;
            try {
              error = JSON.parse(responseText);
            } catch {
              error = { error: responseText || `HTTP ${response.status}` };
            }
            
            console.error('Upload failed - Parsed error:', error);
            const errorMsg = error.details || error.error || error.message || responseText || `Upload failed with status ${response.status}`;
            throw new Error(errorMsg);
          }

          const result = await response.json();
          console.log('Upload success:', result);
          return result;
        });

        await Promise.all(uploadPromises);
        
        // Add files to local state after successful upload
        setSelectedFiles(prev => [...prev, ...Array.from(files)]);
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

        // Upload each file
        const uploadPromises = Array.from(files).map(async (file) => {
          console.log('Uploading file:', file.name, file.type, file.size);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', userId);
          // Optional: Add liveStreamId if needed
          // formData.append('liveStreamId', 'your-stream-id');

          const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: formData,
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            // Try to get response as text first
            const responseText = await response.text();
            console.error('Upload failed - Status:', response.status);
            console.error('Upload failed - Response text:', responseText);
            
            // Try to parse as JSON
            let error;
            try {
              error = JSON.parse(responseText);
            } catch {
              error = { error: responseText || `HTTP ${response.status}` };
            }
            
            console.error('Upload failed - Parsed error:', error);
            const errorMsg = error.details || error.error || error.message || responseText || `Upload failed with status ${response.status}`;
            throw new Error(errorMsg);
          }

          const result = await response.json();
          console.log('Upload success:', result);
          return result;
        });

        await Promise.all(uploadPromises);
        
        // Add files to local state after successful upload
        setSelectedFiles(prev => [...prev, ...Array.from(files)]);
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

              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} multiple style={{ display: "none" }} />
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
            {formattedDate ? (
              <div className="mt-4 text-base text-gray-600">Selected date: <span className="font-medium text-gray-800">{formattedDate}</span></div>
            ) : (
              <p className="mt-4 text-base text-gray-500">Provide a 2-3 sentence description.</p>
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
                        <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
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
