/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Download, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

export default function ViewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pdfLib, setPdfLib] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const documentName = 'Document';

  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF.js library
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const version = pdfjsLib.version;
        console.log('PDF.js version:', version);
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        setPdfLib(pdfjsLib);
      } catch (err) {
        console.error('Failed to load PDF.js:', err);
        setError('Failed to load PDF viewer library');
        setIsLoading(false);
      }
    };
    loadPdfJs();
  }, []);

  // Load PDF data when pdfLib is ready
  useEffect(() => {
    if (!documentId || !pdfLib) return;
    loadPdfData();
  }, [documentId, pdfLib]);

  // Render page when document or page changes
  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  const loadPdfData = async () => {
    if (!pdfLib) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        setError('No authentication token found. Please log in again.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching PDF for document:', documentId);
      
      const apiUrl = `/api/documents/${documentId}/content?token=${encodeURIComponent(accessToken)}`;

      // Use XMLHttpRequest for more reliable binary data handling
      const data = await new Promise<Uint8Array>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const arrayBuffer = xhr.response;
            console.log('XHR received bytes:', arrayBuffer.byteLength);
            if (arrayBuffer.byteLength === 0) {
              reject(new Error('Received empty response'));
            } else {
              resolve(new Uint8Array(arrayBuffer));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error'));
        };
        
        xhr.send();
      });

      console.log('PDF data loaded, size:', data.length);
      setPdfData(data);

      // Load PDF with PDF.js
      const loadingTask = pdfLib.getDocument({ 
        data,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      
      console.log('PDF parsed, pages:', pdf.numPages);
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
      setIsLoading(false);
    }
  };

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      const viewport = page.getViewport({ scale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Provide the canvas element as required by RenderParameters
      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;
      
      console.log('Page', pageNum, 'rendered');
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, scale]);
  
  const handleDownload = () => {
    if (pdfData) {
      // Create a new ArrayBuffer copy
      const newBuffer = new ArrayBuffer(pdfData.length);
      const newArray = new Uint8Array(newBuffer);
      newArray.set(pdfData);
      const blob = new Blob([newBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "ArrowLeft":
          handlePrevPage();
          break;
        case "ArrowRight":
          handleNextPage();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fff6f3] border-b border-[#f0e6e5]">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#8A1538] hover:text-[#6d1029] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="border-l border-[#f0e6e5] pl-4">
                <h1 className="text-gray-800 font-semibold truncate max-w-md">{documentName}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {pdfDoc && (
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-600 hover:text-[#8A1538] hover:bg-white rounded-lg transition-colors"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-gray-600 text-sm min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-600 hover:text-[#8A1538] hover:bg-white rounded-lg transition-colors"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              )}

              <button
                onClick={loadPdfData}
                className="p-2 text-gray-600 hover:text-[#8A1538] hover:bg-white rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-[#8A1538] hover:bg-white rounded-lg transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading || !pdfData}
                className="flex items-center gap-2 px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-[#8A1538] hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pt-20 pb-24 overflow-auto bg-gray-100">
        <div className="flex flex-col items-center justify-start p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 mt-20">
              <svg className="animate-spin w-12 h-12 text-[#8A1538]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
              <p className="text-gray-500">Loading document...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center max-w-md mt-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-red-500 font-semibold">Error Loading Document</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button 
                onClick={loadPdfData} 
                className="px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : pdfDoc ? (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="block" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          ) : null}
        </div>
      </main>

      {/* Page Navigation */}
      {pdfDoc && totalPages > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-2 text-gray-600 hover:text-[#8A1538] rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-700 text-sm font-medium min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-2 text-gray-600 hover:text-[#8A1538] rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
