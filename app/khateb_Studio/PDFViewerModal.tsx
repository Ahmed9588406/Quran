"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, Download, ChevronLeft, ChevronRight, RefreshCw, GripHorizontal } from "lucide-react";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | number;
  documentTitle?: string;
  documentDate?: string;
}

export default function PDFViewerModal({
  isOpen,
  onClose,
  documentId,
  documentTitle = "Khotba Document",
  documentDate,
}: PDFViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pdfLib, setPdfLib] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Center modal on open
  useEffect(() => {
    if (isOpen && !isFullscreen) {
      // Center the modal
      const modalWidth = 600;
      const modalHeight = 500;
      setPosition({
        x: (window.innerWidth - modalWidth) / 2,
        y: (window.innerHeight - modalHeight) / 2,
      });
    }
  }, [isOpen]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep modal within viewport bounds
      const modalWidth = 600;
      const modalHeight = 500;
      const maxX = window.innerWidth - modalWidth;
      const maxY = window.innerHeight - modalHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Load PDF.js library
  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [isOpen]);

  // Load PDF data when pdfLib is ready
  useEffect(() => {
    if (!documentId || !pdfLib || !isOpen) return;
    loadPdfData();
  }, [documentId, pdfLib, isOpen]);

  // Render page when document or page changes
  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPdfDoc(null);
      setPdfData(null);
      setCurrentPage(1);
      setTotalPages(0);
      setScale(1.0);
      setIsFullscreen(false);
      setError(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  const loadPdfData = async () => {
    if (!pdfLib) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      console.log('Fetching PDF for document:', documentId);
      
      const apiUrl = `/api/documents/${documentId}/content${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''}`;

      const data = await new Promise<Uint8Array>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.responseType = 'arraybuffer';
        if (accessToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        }
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const arrayBuffer = xhr.response;
            if (arrayBuffer.byteLength === 0) {
              reject(new Error('Received empty response'));
            } else {
              resolve(new Uint8Array(arrayBuffer));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
      });

      setPdfData(data);

      const loadingTask = pdfLib.getDocument({ 
        data,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      
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

      await page.render({
        canvasContext: context,
        viewport: viewport,
      } as any).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, scale]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setPosition({ x: 0, y: 0 });
    } else {
      // Re-center when exiting fullscreen
      setPosition({
        x: (window.innerWidth - 600) / 2,
        y: (window.innerHeight - 500) / 2,
      });
    }
  };

  const handleDownload = () => {
    if (pdfData) {
      const newBuffer = new ArrayBuffer(pdfData.length);
      const newArray = new Uint8Array(newBuffer);
      newArray.set(pdfData);
      const blob = new Blob([newBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle || "khotba"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "Escape":
          onClose();
          break;
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
  }, [isOpen, onClose, totalPages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal Container - Smaller & Draggable */}
      <div
        ref={modalRef}
        style={isFullscreen ? {} : {
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: 600,
          height: 500,
        }}
        className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden ${
          isFullscreen ? "fixed inset-0 rounded-none" : ""
        }`}
      >
        {/* Draggable Header */}
        <div 
          className={`flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-[#8A1538] to-[#6d1029] shrink-0 ${
            !isFullscreen ? "cursor-move" : ""
          }`}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            {!isFullscreen && (
              <GripHorizontal className="w-4 h-4 text-white/50" />
            )}
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-white truncate max-w-[200px]">{documentTitle}</h2>
              {documentDate && (
                <span className="text-xs text-white/70">{documentDate}</span>
              )}
            </div>
          </div>
          
          {/* Compact Toolbar */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-white text-xs min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-white/20 mx-1" />

            <button
              onClick={(e) => { e.stopPropagation(); loadPdfData(); }}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
              title="Download"
              disabled={!pdfData}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors ml-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 overflow-auto bg-gray-100 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-gray-700 font-medium text-sm">Failed to load PDF</p>
                <p className="text-gray-400 text-xs max-w-[250px]">{error}</p>
                <button
                  onClick={loadPdfData}
                  className="px-3 py-1.5 bg-[#8A1538] text-white text-sm rounded-lg hover:bg-[#6d1029] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {pdfDoc && !isLoading && !error && (
            <div className="p-4 flex justify-center">
              <div className="bg-white shadow-lg rounded overflow-hidden">
                <canvas ref={canvasRef} className="block" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer with page navigation */}
        {pdfDoc && totalPages > 0 && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-2 shrink-0">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 text-gray-500 hover:text-[#8A1538] hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-600 text-xs font-medium min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 text-gray-500 hover:text-[#8A1538] hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
