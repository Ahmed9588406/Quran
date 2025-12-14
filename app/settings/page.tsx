"use client";
import React, { useState } from "react";
import Navbar from "../user/navbar";
import LeftSide from "../user/leftside";
import SettingsTabs from "./settings_tabs";

function Settings() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>("");

  return (
    <div
      className="h-screen flex flex-col overflow-hidden mt-15"
      style={{
        backgroundImage: "url('/icons/settings/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar
        onToggleSidebar={() => setIsLeftOpen((s) => !s)}
        isSidebarOpen={isLeftOpen}
      />

      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={(view) => {
          setActiveView(view || "");
        }}
        activeView={activeView}
      />

      <main className="flex-1 flex justify-center items-start py-6 px-4 overflow-hidden">
        <div className="w-full max-w-[1136px] h-full max-h-[calc(100vh-120px)] flex flex-col">
          <SettingsTabs />
        </div>
      </main>
    </div>
  );
}

export default Settings;
