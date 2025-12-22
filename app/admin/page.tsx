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

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadMosques(), loadRooms(), loadPreachers()]);
    setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <AdminHeader onLogout={handleLogout} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading data...</p>
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
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
