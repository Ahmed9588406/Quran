"use client";

import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div>
            <div className="h-4 w-32 bg-white/5 rounded mb-2" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-3/4 bg-white/5 rounded" />
      </div>
      <div className="flex gap-2 pt-4 border-t border-white/5">
        <div className="h-8 flex-1 bg-white/5 rounded-lg" />
        <div className="h-8 w-8 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-16 h-16 border-4",
    lg: "w-24 h-24 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-emerald-500/20 rounded-full`} />
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} border-transparent border-t-emerald-500 rounded-full animate-spin`} />
      </div>
      <p className="mt-6 text-gray-400 text-sm animate-pulse">Loading...</p>
    </div>
  );
}
