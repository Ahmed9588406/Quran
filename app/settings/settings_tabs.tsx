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

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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

  const handlePasswordChange = async () => {
    // Reset messages
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!passwordData.currentPassword.trim()) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!passwordData.newPassword.trim()) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      if (!token) {
        setPasswordError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('/settings/api', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordSuccess('Password changed successfully!');
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(data.error || data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError('Network error. Please try again.');
    } finally {
      setIsChangingPassword(false);
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
                        className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Email
                      </label>
                      <input
                        placeholder="Please enter your email"
                        className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Username
                      </label>
                      <input
                        placeholder="Please enter your username"
                        className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
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
                          className="flex-1 px-4 py-3 rounded-r-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
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
                      className="w-full px-4 py-3 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm resize-none text-black"
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
            {/* Change Password Section */}
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Change Password
            </h2>

            {/* Error/Success Messages */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {passwordSuccess}
              </div>
            )}

            {/* Old Password */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Please enter your old password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full md:w-1/2 px-4 py-3 pr-12 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute left-1/2 md:left-[calc(50%-1rem)] top-1/2 -translate-y-1/2 p-0 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {showPasswords.current ? (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password & Confirm New Password - side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Please enter your New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {showPasswords.new ? (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Please Confirm your New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-md bg-[#fff6f3] border border-[#f3d9c9] outline-none text-sm text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Logout & Add Existing Account */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Logout & Add Exiting Account
              </h3>
              <div className="flex items-center gap-4">
                <button className="px-5 py-2.5 bg-[#7a1233] text-white rounded-md text-sm font-medium hover:bg-[#5a0d26] transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
                <button className="px-5 py-2.5 border border-[#7a1233] text-[#7a1233] rounded-md text-sm font-medium hover:bg-[#fff6f3] transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Switch Account
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#ecd6c9] my-6"></div>

            {/* Update Profile & Reset */}
            <div className="flex items-center gap-6">
              <button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="px-6 py-3 bg-[#7a1233] text-white rounded-md text-sm font-medium hover:bg-[#5a0d26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Changing Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
              <button 
                onClick={() => {
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setShowPasswords({ current: false, new: false, confirm: false });
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="text-[#d19a62] text-sm font-medium hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
