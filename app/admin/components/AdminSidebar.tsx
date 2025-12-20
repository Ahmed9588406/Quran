"use client";
import React from "react";
import { LayoutDashboard, Radio, MapPin, Disc, Settings, HelpCircle } from "lucide-react";

type AdminView = "dashboard" | "streams" | "mosques" | "recordings";

type Props = {
  isOpen: boolean;
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  onClose: () => void;
};

const menuItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "streams", label: "Live Streams", icon: <Radio className="w-5 h-5" /> },
  { id: "mosques", label: "Mosques Map", icon: <MapPin className="w-5 h-5" /> },
  { id: "recordings", label: "Recordings", icon: <Disc className="w-5 h-5" /> },
];

export default function AdminSidebar({ isOpen, activeView, onViewChange, onClose }: Props) {
  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-100 transition-all duration-300 z-40 flex flex-col ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Main Menu */}
      <div className="flex-1 py-4">
        <div className={`px-4 mb-4 ${!isOpen && "hidden"}`}>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Main Menu
          </span>
        </div>

        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                activeView === item.id
                  ? "bg-[#8A1538] text-white"
                  : "text-gray-600 hover:bg-[#FFF9F3] hover:text-[#8A1538]"
              }`}
            >
              <span className={activeView === item.id ? "text-white" : "text-[#8A1538]"}>
                {item.icon}
              </span>
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 py-4 px-2">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-[#FFF9F3] hover:text-[#8A1538] transition-colors">
          <Settings className="w-5 h-5 text-[#8A1538]" />
          {isOpen && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-[#FFF9F3] hover:text-[#8A1538] transition-colors">
          <HelpCircle className="w-5 h-5 text-[#8A1538]" />
          {isOpen && <span className="text-sm font-medium">Help</span>}
        </button>
      </div>
    </aside>
  );
}
