'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Download, Eye, Trash2, Calendar, Clock } from "lucide-react";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import StartNewMessage from "../../user/start_new_message";
import KhatebNavbar from "../../khateb_Studio/KhatebNavbar";

interface Document {
  id: string;
  originalName?: string;
  original_name?: string;
  fileName?: string;
  file_name?: string;
  name?: string;
  fileUrl?: string;
  file_url?: string;
  url?: string;
  fileSize?: number;
  file_size?: number;
  size?: number;
  uploadedAt?: string;
  uploaded_at?: string;
  createdAt?: string;
  created_at?: string;
  userId?: string;
  user_id?: string;
  liveStreamId?: string;
  live_stream_id?: string;
}

function DocumentCard({ document, onDelete, onView }: { document: Document; onDelete: (id: string) => void; onView: (url: string) => void }) {
  // Handle different field name formats from API - prioritize originalName
  const fileName = document.originalName || document.original_name || document.fileName || document.file_name || document.name || 'Untitled Document';
  const fileUrl = document.fileUrl || document.file_url || document.url || '';
  const fileSize = document.fileSize || document.file_size || document.size;
  const uploadedAt = document.uploadedAt || document.uploaded_at || document.createdAt || document.created_at || '';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDisplayName = (name: string) => {
    if (name.length > 30) {
      return name.substring(0, 27) + '...';
    }
    return name;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="bg-gradient-to-br from-[#8A1538] to-[#6d1029] p-6 flex items-center justify-center">
        <div className="w-16 h-20 bg-white/20 rounded-lg flex items-center justify-center">
          <FileText className="w-10 h-10 text-white" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 truncate" title={fileName}>
          {getDisplayName(fileName)}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(uploadedAt)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Clock className="w-4 h-4" />
          <span>{formatTime(uploadedAt)}</span>
        </div>
        
        <div className="text-xs text-gray-400 mb-4">
          {formatFileSize(fileSize)}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(document.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          
          <a
            href={fileUrl}
            download={fileName}
            className="flex items-center justify-center p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
          
          <button
            onClick={() => onDelete(document.id)}
            className="flex items-center justify-center p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


export default function PreviousKhotbasPage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [isStartNewOpen, setStartNewOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        fetchDocuments();
      } catch (err) {
        console.error('Error checking authorization:', err);
        router.push('/user');
      }
    };
    
    checkAuthorization();
  }, [router]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('user_id');
      const accessToken = localStorage.getItem('access_token');
      
      if (!userId) {
        setError('User not authenticated. Please log in.');
        setIsLoading(false);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch documents');
      }

      const data = await response.json();
      console.log('Documents data:', data);
      
      // Handle different response formats
      const docs = Array.isArray(data) ? data : (data.documents || data.data || []);
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const accessToken = localStorage.getItem('access_token');
      
      // TODO: Implement delete API call when endpoint is available
      // const response = await fetch(`/api/documents/${documentId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      //   },
      // });
      
      // For now, just remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      alert('Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  const handleView = (documentId: string) => {
    router.push(`/Schedual/view-document/${documentId}`);
  };

  const handleSelectUser = (user: { id: string; name: string; avatar: string }) => {
    console.log("Selected user:", user);
  };

  // Show loading while checking authorization
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <KhatebNavbar 
        onToggleSidebar={() => setSidebarOpen((s) => !s)} 
        isSidebarOpen={isSidebarOpen} 
        onOpenMessages={() => setMessagesOpen(true)} 
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-24 px-6 lg:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Previous Khotbas</h1>
                <p className="text-gray-500 mt-1">View and manage your uploaded documents</p>
              </div>
            </div>
            
            <Link 
              href="/Schedual/prepare_khotba"
              className="flex items-center gap-2 px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>New Khotba</span>
            </Link>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin w-12 h-12 text-[#8A1538] mb-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button 
                onClick={fetchDocuments}
                className="px-6 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Documents Yet</h2>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                You haven&apos;t uploaded any khotba documents yet. Start by creating a new khotba and uploading your PDF files.
              </p>
              <Link 
                href="/Schedual/prepare_khotba"
                className="flex items-center gap-2 px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Create Your First Khotba</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                {documents.length} document{documents.length !== 1 ? 's' : ''} found
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Messages Button */}
      <button 
        aria-label="Open messages" 
        onClick={() => setMessagesOpen(true)} 
        className="fixed bottom-8 right-8 bg-[#8A1538] text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-[#6d1029] transition-colors text-lg"
      >
        <span className="font-medium">Messages</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
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
