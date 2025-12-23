"use client";

import React from "react";
import { Preacher } from "../types";

interface PreachersTabProps {
  preachers: Preacher[];
}

export function PreachersTab({ preachers }: PreachersTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Preachers</h2>
          <p className="text-sm text-gray-400 mt-1">View all registered preachers</p>
        </div>
      </div>

      {preachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <p className="text-gray-300 font-medium">No preachers found</p>
          <p className="text-gray-500 text-sm mt-1">Preachers will appear here once registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preachers.map((preacher) => (
            <PreacherCard key={preacher.id} preacher={preacher} />
          ))}
        </div>
      )}
    </div>
  );
}

function PreacherCard({ preacher }: { preacher: Preacher }) {
  return (
    <div className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-violet-500/30 rounded-2xl p-5 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-semibold text-violet-400">
            {(preacher.displayName || preacher.username).charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white truncate">{preacher.displayName || preacher.username}</h3>
            {preacher.verified && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">@{preacher.username}</p>
        </div>
      </div>
      
      {/* Details */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-400 truncate">{preacher.email || "No email provided"}</span>
        </div>
        
        {preacher.bio && (
          <div className="flex items-start gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-gray-400 line-clamp-2">{preacher.bio}</span>
          </div>
        )}
        
        {!preacher.bio && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-gray-500 italic">No bio available</span>
          </div>
        )}
      </div>
      
      {/* ID Badge */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <span className="text-xs text-gray-500">ID: {preacher.id}</span>
      </div>
    </div>
  );
}
