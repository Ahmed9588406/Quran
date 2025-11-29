"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
type TabType = "account" | "interface" | "security";

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      const stored = localStorage.getItem("theme");
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return stored === "dark" || (!stored && prefersDark);
    } catch (e) {
      return false;
    }
  });
  const [language, setLanguage] = useState<string>("English");

  // apply theme based on darkMode on mount and when it changes
  useEffect(() => {
    try {
      if (darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {
      // ignore in SSR
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    try {
      const next = !darkMode;
      setDarkMode(next);
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (e) {
      // ignore
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "account", label: "Account Settings" },
    { id: "interface", label: "Interface" },
    { id: "security", label: "Login & Security" },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-sm rounded-t-2xl px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-[#7a1233] border-b-2 border-[#7a1233]"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content - removed inner scroll so panels expand naturally */}
      <div className="overflow-visible">
        {/* Account Settings Tab */}
        {activeTab === "account" && (
          <div className="bg-white rounded-b-2xl shadow-sm p-6">
            <div className="w-full md:w-56 flex-shrink-0">
              <h1 className="text-[#4C535F] ml-10">Your Profile Picture</h1>
              <div className="h-40 flex items-center justify-center bg-transparent">
                <div className="text-center px-3">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-md overflow-hidden bg-transparent flex items-center justify-center">
                    <Image
                      id="profile-preview"
                      alt="profile"
                      src={
                        typeof window !== "undefined" && localStorage.getItem("profileImage")
                          ? (localStorage.getItem("profileImage") as string)
                          : "/icons/settings/upload_image.svg"
                      }
                      className="w-full h-full object-contain object-center cursor-pointer"
                      onClick={() => document.getElementById("profile-upload")?.click()}
                        width={80}
                        height={80}
                    />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = reader.result as string;
                          try {
                            localStorage.setItem("profileImage", dataUrl);
                          } catch (err) {
                            console.error("Failed to save image to localStorage", err);
                          }
                          const img = document.getElementById("profile-preview") as HTMLImageElement | null;
                          if (img) img.src = dataUrl;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">Upload your photo</div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#ecd6c9] mt-4 pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Upload / Avatar */}
                

                {/* Right: Form fields */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Full name
                      </label>
                      <input
                        placeholder="Please enter your full name"
                        className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Email
                      </label>
                      <input
                        placeholder="Please enter your email"
                        className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Username
                      </label>
                      <input
                        placeholder="Please enter your username"
                        className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Phone number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md bg-[#fff6f3] border border-r-0 border-[#f3d9c9] text-sm text-gray-600">
                          +1
                        </span>
                        <input
                          placeholder="Please enter your phone number"
                          className="flex-1 px-4 py-3 rounded-r-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write your Bio here e.g your hobbies, interests ETC"
                      className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm resize-none"
                    />
                  </div>

                  <div className="mt-6 flex items-center gap-6">
                    <button className="px-6 py-3 bg-[#7a1233] text-white rounded-md text-sm font-medium hover:bg-[#5a0d26] transition-colors">
                      Update Profile
                    </button>
                    <button className="text-[#d19a62] text-sm font-medium hover:underline">
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interface Tab */}
        {activeTab === "interface" && (
          <div className="bg-white rounded-b-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-xl font-semibold text-gray-800">Interface Settings</h2>

            {/* Theme card - Dark Mode row */}
            <div className="rounded-lg border border-[#ecd6c9] p-3 w-130 bg-[#fffaf8] flex items-center justify-between">
              <div>
              <div className="text-sm font-medium text-[#7a1233]">Dark Mode</div>
              <div className="text-xs text-gray-500">Toggle application dark mode</div>
              </div>

              <div className="flex items-center gap-3">
              <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${darkMode ? "text-green-700 bg-green-100" : "text-gray-600 bg-gray-100"}`}>
                {darkMode ? "ON" : "OFF"}
              </div>
              <button
                onClick={toggleDarkMode}
                aria-pressed={darkMode}
                className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${darkMode ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
              </div>
            </div>

            {/* Language card */}
            <div className="rounded-lg border border-[#ecd6c9] p-3 w-130 bg-[#fffaf8] flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#7a1233]">Change Language</div>
                <div className="text-xs text-gray-500">Select your preferred language</div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 rounded-md border border-[#f0e6e5] bg-white text-sm focus:outline-none"
                >
                  <option>English</option>
                  <option>العربية (Arabic)</option>
                  <option>Français (French)</option>
                  <option>Türkçe (Turkish)</option>
                  <option>Bahasa Indonesia</option>
                </select>
                <svg className="w-5 h-5 text-[#7a1233]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-6 pt-2">
                <button className="px-6 py-3 bg-[#7a1233] text-white rounded-md text-sm font-medium hover:bg-[#5a0d26] transition-colors">
                  Update Profile
                </button>
                <button className="text-[#d19a62] text-sm font-medium hover:underline">
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login & Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white rounded-b-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Login & Security
            </h2>

            {/* Password & 2FA in row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Password Section */}
              <div>
                <h3 className="text-base font-medium text-gray-700 mb-3">
                  Change Password
                </h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1233] focus:border-transparent outline-none text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1233] focus:border-transparent outline-none text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1233] focus:border-transparent outline-none text-sm"
                  />
                  <button className="px-4 py-2 bg-[#7a1233] text-white rounded-lg font-medium hover:bg-[#5a0d26] transition-colors text-sm">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <h3 className="text-base font-medium text-gray-700 mb-3">
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">2FA</p>
                    <p className="text-xs text-gray-500">Extra security layer</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-700 mb-3">
                Active Sessions
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        Windows PC - Chrome
                      </p>
                      <p className="text-xs text-gray-500">
                        Cairo, Egypt • Current
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        iPhone 14 - Safari
                      </p>
                      <p className="text-xs text-gray-500">
                        Cairo, Egypt • 2 days ago
                      </p>
                    </div>
                  </div>
                  <button className="text-xs text-red-600 font-medium hover:text-red-700">
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently delete your account</p>
                </div>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
