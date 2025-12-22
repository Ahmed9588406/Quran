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
        <h2 className="text-2xl font-bold text-gray-800">Preachers</h2>
      </div>

      {preachers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl block mb-4">👤</span>
          <p>No preachers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preachers.map((preacher) => (
            <div key={preacher.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{preacher.displayName || preacher.username}</h3>
                  <p className="text-sm text-gray-500">@{preacher.username}</p>
                </div>
                {preacher.verified && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {preacher.email || "N/A"}</p>
                <p><span className="font-medium">Bio:</span> {preacher.bio || "No bio"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
