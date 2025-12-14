/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import NavBar from '../../../user/navbar';
import LeftSide from '../../../user/leftside';
import { Clock, XCircle, RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';
import { FatwaDetail } from './FatwaDetail';

type FatwaStatus = 'pending' | 'rejected' | 'answered';

type Fatwa = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  status: FatwaStatus;
  rejectionReason?: string;
};

type ApiResponse = {
  content: Fatwa[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

function FatwaCard({ fatwa, status, onView }: { fatwa: any; status: FatwaStatus; onView?: (fatwa: any) => void }) {
  const isPending = status === 'pending';
  const isAnswered = status === 'answered';
  
  return (
    <article className={`group relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border ${isPending ? 'border-yellow-100 hover:border-yellow-200' : isAnswered ? 'border-[#f0e6e5] hover:border-[#7b2030]' : 'border-red-100 hover:border-red-200'} overflow-hidden`}>
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${isPending ? 'bg-yellow-400' : isAnswered ? 'bg-[#7b2030]' : 'bg-red-400'}`} />
      
      <header className="flex items-start gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 ${isPending ? 'bg-gradient-to-br from-yellow-100 to-yellow-50' : isAnswered ? 'bg-gradient-to-br from-[#7b2030]/10 to-[#9a2a3f]/10' : 'bg-gradient-to-br from-red-100 to-red-50'}`}>
          {isPending ? (
            <Clock className="w-5 h-5 text-yellow-600" />
          ) : isAnswered ? (
            <CheckCircle className="w-5 h-5 text-[#7b2030]" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${isPending ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700' : isAnswered ? 'bg-gradient-to-r from-[#7b2030]/10 to-[#9a2a3f]/10 text-[#7b2030]' : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700'}`}>
              {isPending ? 'Pending Review' : isAnswered ? 'Answered' : 'Rejected'}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {new Date(fatwa.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h4 className="text-base font-semibold text-gray-800 group-hover:text-[#7b2030] transition-colors">{fatwa.question?.substring(0, 60) || 'Fatwa'}{fatwa.question?.length > 60 ? '...' : ''}</h4>
        </div>
      </header>

      <p className="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed">{fatwa.question}</p>

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={() => onView?.(fatwa)}
          className="group/btn px-4 py-2 text-sm font-medium rounded-xl border border-[#f0e6e5] bg-white hover:bg-gradient-to-r hover:from-[#7b2030] hover:to-[#9a2a3f] hover:text-white hover:border-transparent transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
}

export default function MyFatwasPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('pray');
  const [activeTab, setActiveTab] = useState<FatwaStatus>('pending');
  
  const [pendingFatwas, setPendingFatwas] = useState<Fatwa[]>([]);
  const [rejectedFatwas, setRejectedFatwas] = useState<Fatwa[]>([]);
  const [answeredFatwas, setAnsweredFatwas] = useState<Fatwa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pendingPage, setPendingPage] = useState(0);
  const [rejectedPage, setRejectedPage] = useState(0);
  const [answeredPage, setAnsweredPage] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [rejectedTotal, setRejectedTotal] = useState(0);
  const [answeredTotal, setAnsweredTotal] = useState(0);
  const pageSize = 10;

  const fetchFatwas = async (status: FatwaStatus, page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      let endpoint: string;

      if (status === 'answered') {
        endpoint = `/pray/fatwa/my-fatwas/api?answered=true&size=${pageSize}&page=${page}`;
      } else {
        endpoint = `/pray/fatwa/my-fatwas/api?status=${encodeURIComponent(status)}&size=${pageSize}&page=${page}`;
      }

      console.log('Fetching fatwas (proxy):', { endpoint, status, page, pageSize, tokenPresent: !!token });

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text();
        console.error(`Fetch failed for ${status} fatwas`, { endpoint, httpStatus: response.status, body: text });
        throw new Error(`Failed to fetch ${status} fatwas`);
      }

      const data: ApiResponse = await response.json();

      console.log(`${status} fatwas response:`, { endpoint, httpStatus: response.status, fullData: data });
      if (status === 'pending') {
        setPendingFatwas(data.content || []);
        setPendingTotal(data.totalElements || 0);
      } else if (status === 'rejected') {
        setRejectedFatwas(data.content || []);
        setRejectedTotal(data.totalElements || 0);
      } else {
        setAnsweredFatwas(data.content || []);
        setAnsweredTotal(data.totalElements || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFatwas('pending', pendingPage);
    fetchFatwas('rejected', rejectedPage);
    fetchFatwas('answered', answeredPage);
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchFatwas('pending', pendingPage);
    }
  }, [pendingPage]);

  useEffect(() => {
    if (activeTab === 'rejected') {
      fetchFatwas('rejected', rejectedPage);
    }
  }, [rejectedPage]);

  useEffect(() => {
    if (activeTab === 'answered') {
      fetchFatwas('answered', answeredPage);
    }
  }, [answeredPage]);

  const currentFatwas = activeTab === 'pending' ? pendingFatwas : activeTab === 'rejected' ? rejectedFatwas : answeredFatwas;
  const currentTotal = activeTab === 'pending' ? pendingTotal : activeTab === 'rejected' ? rejectedTotal : answeredTotal;
  const currentPage = activeTab === 'pending' ? pendingPage : activeTab === 'rejected' ? rejectedPage : answeredPage;
  const setCurrentPage = activeTab === 'pending' ? setPendingPage : activeTab === 'rejected' ? setRejectedPage : setAnsweredPage;

  const tabs: { id: FatwaStatus; label: string; count: number }[] = [
    { id: 'pending', label: 'Pending', count: pendingTotal },
    { id: 'rejected', label: 'Rejected', count: rejectedTotal },
    { id: 'answered', label: 'Answered', count: answeredTotal },
  ];

  const [selectedFatwa, setSelectedFatwa] = useState<any | null>(null);

  return (
    <>
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} />
      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(v) => setActiveView(v)}
        activeView={activeView}
      />

      <main
        className="pt-10 min-h-screen"
        style={{
          backgroundImage: "url('/icons/settings/background.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#fffaf9'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          {/* Page heading with modern gradient */}
          <div className="text-center mb-10">
            <div className="inline-block">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b2030] via-[#9a2a3f] to-[#7b2030] bg-clip-text text-transparent mb-2">
                فتاواي
              </h1>
              <div className="h-1 bg-gradient-to-r from-transparent via-[#7b2030] to-transparent rounded-full" />
            </div>
            <p className="text-gray-500 text-sm mt-3 font-medium">My Fatwas</p>
          </div>

          {/* Modern Tab Navigation */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-[#f0e6e5] shadow-xl overflow-hidden mb-6">
            <div className="flex items-center gap-2 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative flex items-center justify-center gap-3 rounded-2xl ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#7b2030] to-[#9a2a3f] text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.id === 'pending' ? (
                    <Clock className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  ) : tab.id === 'answered' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  {tab.label}
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.id === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : tab.id === 'answered'
                        ? 'bg-gradient-to-r from-[#7b2030]/10 to-[#9a2a3f]/10 text-[#7b2030]'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
              
              <button
                onClick={() => fetchFatwas(activeTab, currentPage)}
                className="px-4 py-4 text-gray-500 hover:text-[#7b2030] hover:bg-gray-50 rounded-2xl transition-all duration-300"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-[#f0e6e5] shadow-xl p-8 min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#7b2030]/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#7b2030] animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-500 font-medium">Loading fatwas...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <p className="text-red-600 mb-4 font-medium text-lg">{error}</p>
                <button
                  onClick={() => fetchFatwas(activeTab, currentPage)}
                  className="px-6 py-3 bg-gradient-to-r from-[#7b2030] to-[#9a2a3f] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : currentFatwas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  activeTab === 'pending' ? 'bg-yellow-100' : activeTab === 'answered' ? 'bg-gradient-to-br from-[#7b2030]/10 to-[#9a2a3f]/10' : 'bg-red-100'
                }`}>
                  {activeTab === 'pending' ? (
                    <Clock className="w-10 h-10 text-yellow-600" />
                  ) : activeTab === 'answered' ? (
                    <CheckCircle className="w-10 h-10 text-[#7b2030]" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
                <p className="text-gray-600 font-medium text-lg">
                  {activeTab === 'pending' 
                    ? 'No pending fatwas' 
                    : activeTab === 'answered'
                    ? 'No answered fatwas'
                    : 'No rejected fatwas'}
                </p>
                <p className="text-gray-400 text-sm mt-2">Check back later for updates</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-medium text-gray-600">
                    Showing <span className="text-[#7b2030] font-bold">{currentFatwas.length}</span> of <span className="text-[#7b2030] font-bold">{currentTotal}</span> {activeTab === 'answered' ? 'answered' : activeTab} fatwas
                  </p>
                </div>
                
                <div className="space-y-4">
                  {currentFatwas.map((fatwa) => (
                    <FatwaCard key={fatwa.id} fatwa={fatwa} status={activeTab} onView={(fatwaData) => setSelectedFatwa(fatwaData)} />
                  ))}
                </div>

                {currentTotal > pageSize && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-5 py-3 bg-white border-2 border-[#f0e6e5] rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-[#7b2030] hover:to-[#9a2a3f] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-gray-700 px-4">
                      Page <span className="text-[#7b2030]">{currentPage + 1}</span> of <span className="text-[#7b2030]">{Math.ceil(currentTotal / pageSize)}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={(currentPage + 1) * pageSize >= currentTotal}
                      className="px-5 py-3 bg-white border-2 border-[#f0e6e5] rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-[#7b2030] hover:to-[#9a2a3f] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {selectedFatwa !== null && (
        <FatwaDetail fatwa={selectedFatwa} onClose={() => setSelectedFatwa(null)} />
      )}
    </>
  );
}