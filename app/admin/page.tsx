"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "./components/AdminHeader";
import { TabNavigation } from "./components/TabNavigation";
import { MosquesTab } from "./components/MosquesTab";
import { RoomsTab } from "./components/RoomsTab";
import { PreachersTab } from "./components/PreachersTab";
import { Toast } from "./components/Toast";
import { LoginModal } from "./components/LoginModal";
import { Mosque, Room, Preacher, ToastMessage } from "./types";

const API_BASE = "/api/admin";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"mosques" | "rooms" | "preachers">("mosques");
  const [adminToken, setAdminToken] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadMosques = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/mosques?size=100`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setMosques(data.content || []);
    } catch (error) {
      console.error("Error loading mosques:", error);
      showToast("Failed to load mosques", "error");
    }
  }, [adminToken, showToast]);

  const loadRooms = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/rooms?size=100`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setRooms(data.content || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  }, [adminToken]);

  const loadPreachers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/preachers?size=100`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setPreachers(data.content || []);
    } catch (error) {
      console.error("Error loading preachers:", error);
    }
  }, [adminToken]);

  const loadAllData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    await Promise.all([loadMosques(), loadRooms(), loadPreachers()]);
    setLoading(false);
    setRefreshing(false);
  }, [loadMosques, loadRooms, loadPreachers]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    } else {
      setShowLogin(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      loadAllData();
    }
  }, [adminToken, loadAllData]);

  const handleLogin = (token: string) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken("");
    setShowLogin(true);
    setMosques([]);
    setRooms([]);
    setPreachers([]);
  };

  if (showLogin) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      <div className="relative z-10">
        <AdminHeader 
          onLogout={handleLogout} 
          onRefresh={() => loadAllData(true)}
          refreshing={refreshing}
          stats={{ mosques: mosques.length, rooms: rooms.length, preachers: preachers.length }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
                </div>
                <p className="mt-6 text-gray-400 text-sm animate-pulse">Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {activeTab === "mosques" && (
                  <MosquesTab
                    mosques={mosques}
                    preachers={preachers}
                    adminToken={adminToken}
                    apiBase={API_BASE}
                    onRefresh={loadMosques}
                    showToast={showToast}
                  />
                )}
                {activeTab === "rooms" && (
                  <RoomsTab
                    rooms={rooms}
                    mosques={mosques}
                    adminToken={adminToken}
                    apiBase={API_BASE}
                    onRefresh={() => { loadRooms(); loadMosques(); }}
                    showToast={showToast}
                  />
                )}
                {activeTab === "preachers" && (
                  <PreachersTab preachers={preachers} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
