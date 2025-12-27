"use client";

import React, { useState } from "react";

interface LoginModalProps {
  onLogin: (token: string) => void;
}

export function LoginModal({ onLogin }: LoginModalProps) {
  const [token, setToken] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onLogin(token.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(138,21,56,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(138,21,56,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-[#8A1538]/10 rounded-3xl blur-xl" />
        
        <div className="relative bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8A1538] to-[#6d1029] flex items-center justify-center shadow-lg shadow-[#8A1538]/30">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Enter your admin token to access the dashboard</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin JWT Token
              </label>
              <div className={`relative rounded-xl transition-all duration-300 ${isFocused ? "ring-2 ring-[#8A1538]/50" : ""}`}>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 resize-none h-32 focus:outline-none focus:border-[#8A1538] transition-colors"
                  placeholder="Paste your JWT token here..."
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!token.trim()}
              className="w-full py-3.5 rounded-xl font-medium text-white bg-[#8A1538] hover:bg-[#6d1029] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              Access Dashboard
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Secure admin access • Mosque Live Streaming
          </p>
        </div>
      </div>
    </div>
  );
}
