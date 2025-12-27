"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const typeConfig = {
  success: {
    bg: "bg-[#8A1538]/10 border-[#8A1538]/30",
    icon: (
      <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    text: "text-[#8A1538]",
  },
  error: {
    bg: "bg-red-500/10 border-red-500/30",
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    text: "text-red-500",
  },
  info: {
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "text-blue-500",
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    text: "text-amber-500",
  },
};

export function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = typeConfig[type];

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div 
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white border ${config.bg} shadow-2xl min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0">{config.icon}</div>
        <p className={`flex-1 text-sm ${config.text}`}>{message}</p>
        <button 
          onClick={onClose} 
          className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
