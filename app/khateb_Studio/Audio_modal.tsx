/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Script from "next/script";
import { ChevronDown, Mic, MicOff, User, Edit2, MoreVertical, ExternalLink, Share2 } from "lucide-react";
import ShareModal from "./share_modal";
import AudioSettingsModal from "./Audio_settings_modal";
import LiveSettings from "./Live_settings";

// Janus server configuration
const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
const BACKEND_BASE = "/api/admin/stream";

declare const Janus: any;

type Listener = {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
};

type Props = {
  open: boolean;
  onClose: () => void;
  participantsCount?: number;
  roomId?: number;
  liveStreamId?: number;
  topic?: string;
};

type BroadcastStatus = "idle" | "connecting" | "live" | "ended";

export default function AudioModal({ 
  open, 
  onClose, 
  participantsCount = 0,
  roomId: propRoomId,
  liveStreamId: propLiveStreamId,
  topic = "Khotba"
}: Props) {
  // UI State
  const [muted, setMuted] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ top: 240, left: 1007 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareAnchor, setShareAnchor] = useState<DOMRect | null>(null);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [audioSettingsAnchor, setAudioSettingsAnchor] = useState<DOMRect | null>(null);
  const [isLiveSettingsOpen, setIsLiveSettingsOpen] = useState(false);
  const [khotbaName, setKhotbaName] = useState(topic);
  const [isEditingName, setIsEditingName] = useState(false);

  // Broadcast State
  const [status, setStatus] = useState<BroadcastStatus>("idle");
  const [statusText, setStatusText] = useState("Ready to broadcast");
  const [listenerCount, setListenerCount] = useState(participantsCount);
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [duration, setDuration] = useState("00:00");
  const [janusLoaded, setJanusLoaded] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: "success" | "danger" | "info" }[]>([]);

  // Room info from localStorage or props
  const [roomId, setRoomId] = useState<number>(propRoomId || 0);
  const [liveStreamId, setLiveStreamId] = useState<number>(propLiveStreamId || 0);
  const [preacherName, setPreacherName] = useState("Host");
  const [preacherAvatar, setPreacherAvatar] = useState<string | null>(null);

  // Refs for Janus
  const modalRef = useRef<HTMLDivElement>(null);
  const janusRef = useRef<any>(null);
  const pluginHandleRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const listenerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load room info and user data from localStorage on mount
  useEffect(() => {
    if (!open) return;
    
    const loadRoomInfo = async () => {
      try {
        const preacherId = localStorage.getItem("user_id");
        const token = localStorage.getItem("access_token");
        const userStr = localStorage.getItem("user");
        
        // Load user info for name and avatar
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            // Get name - try multiple possible field names
            const firstName = user.firstName || user.first_name || '';
            const lastName = user.lastName || user.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const name = fullName || user.displayName || user.name || user.username || "Host";
            setPreacherName(name);
            
            // Get avatar from user object - try multiple possible field names
            const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatar || user.avatar_url || user.profileImage || user.image || user.photo;
            if (avatar) {
              setPreacherAvatar(avatar);
              console.log("Preacher avatar loaded:", avatar);
            }
            
            console.log("Preacher info loaded:", { name, hasAvatar: !!avatar });
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        if (!preacherId || !token) {
          console.warn("Missing preacherId or token for room info");
          return;
        }

        // Update roomId and liveStreamId from props if provided
        if (propRoomId) setRoomId(propRoomId);
        if (propLiveStreamId) setLiveStreamId(propLiveStreamId);

        // Fetch room info if not provided via props
        if (!propRoomId || !propLiveStreamId) {
          console.log("Fetching room info for preacher:", preacherId);
          const response = await fetch(
            `/api/stream/room-info?preacherId=${preacherId}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            console.log("Room info received:", data);
            setRoomId(data.roomId);
            setLiveStreamId(data.liveStreamId);
            
            // Also get preacher name from room info if available
            if (data.displayName) {
              setPreacherName(data.displayName);
            }
          } else {
            console.error("Failed to fetch room info:", response.status);
          }
        }
      } catch (err) {
        console.error("Error loading room info:", err);
      }
    };

    loadRoomInfo();
  }, [open, propRoomId, propLiveStreamId]);

  // Alert helper
  const showAlert = useCallback((message: string, type: "success" | "danger" | "info") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 5000);
  }, []);

  // Duration counter
  const startDurationCounter = useCallback(() => {
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setDuration(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }
    }, 1000);
  }, []);

  // Listener polling
  const startListenerPolling = useCallback(() => {
    if (!liveStreamId) return;
    
    listenerIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=listeners`);
        if (!response.ok) return;
        
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setListenerCount(data.listeners || data.listenerCount || 0);
          
          // Update listeners list if available
          if (data.listenersList && Array.isArray(data.listenersList)) {
            setListeners(data.listenersList.map((l: any) => ({
              id: l.userId || l.id || String(Math.random()),
              name: l.displayName || l.name || "Listener",
              avatar: l.avatar,
              joinedAt: new Date(l.joinedAt || Date.now()),
            })));
          }
        } catch {
          console.warn("Failed to parse listener response");
        }
      } catch (error) {
        console.error("Error polling listeners:", error);
      }
    }, 3000);
  }, [liveStreamId]);

  // Attach Janus plugin
  const attachPlugin = useCallback(() => {
    if (!janusRef.current || !roomId) return;
    
    setStatusText("Joining room...");
    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (handle: any) => {
        pluginHandleRef.current = handle;
        const join = { request: "join", room: roomId, ptype: "publisher", display: preacherName };
        handle.send({ message: join });
      },
      error: (err: any) => {
        setStatus("idle");
        setStatusText("Failed to join");
        showAlert("Plugin error: " + err, "danger");
      },
      onmessage: (msg: any, jsep: any) => {
        const event = msg["videoroom"];
        if (event === "joined") {
          setStatusText("Publishing audio...");
          pluginHandleRef.current.createOffer({
            media: { audio: true, video: false },
            stream: localStreamRef.current,
            success: (jsepOffer: any) => {
              const publish = { request: "publish", audio: true, video: false };
              pluginHandleRef.current.send({ message: publish, jsep: jsepOffer });
            },
            error: (err: any) => {
              setStatus("idle");
              setStatusText("Publish error");
              showAlert("Offer error: " + err, "danger");
            },
          });
        } else if (event === "event" && msg["configured"] === "ok") {
          broadcastingRef.current = true;
          startTimeRef.current = Date.now();
          setStatus("live");
          setStatusText("🔴 LIVE");
          setMuted(false);
          showAlert("You are now LIVE!", "success");
          startDurationCounter();
          startListenerPolling();
        }
        if (jsep) pluginHandleRef.current.handleRemoteJsep({ jsep });
      },
    });
  }, [roomId, preacherName, showAlert, startDurationCounter, startListenerPolling]);

  // Start Janus connection
  const startJanus = useCallback(() => {
    // Check if Janus is available
    if (typeof Janus === "undefined") {
      console.error("Janus library not loaded yet");
      showAlert("Streaming library not loaded. Please wait and try again.", "danger");
      setStatus("idle");
      setStatusText("Library not loaded");
      return;
    }
    
    setStatusText("Connecting to server...");
    Janus.init({
      debug: "all",
      callback: () => {
        janusRef.current = new Janus({
          server: JANUS_SERVER,
          success: attachPlugin,
          error: (err: any) => {
            setStatus("idle");
            setStatusText("Connection error");
            showAlert("Janus error: " + err, "danger");
          },
          destroyed: () => setStatusText("Connection closed"),
        });
      },
    });
  }, [attachPlugin, showAlert]);

  // Start broadcasting
  const startBroadcast = async () => {
    console.log("startBroadcast called", { roomId, liveStreamId, janusLoaded, status });
    
    if (!roomId || !liveStreamId) {
      showAlert("Room info not loaded. Please try again.", "danger");
      console.error("Missing room info:", { roomId, liveStreamId });
      return;
    }

    // Check if Janus is actually available in window
    if (typeof window === "undefined" || typeof (window as any).Janus === "undefined") {
      showAlert("Streaming library not loaded yet. Please wait a moment and try again.", "danger");
      console.error("Janus not available in window");
      return;
    }
    
    try {
      setStatus("connecting");
      setStatusText("Requesting microphone access...");
      console.log("Requesting microphone access...");
      
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      showAlert("Microphone ready!", "success");
      startJanus();
    } catch (err: any) {
      console.error("Microphone error:", err);
      showAlert("Microphone permission denied: " + (err.message || err), "danger");
      setStatus("idle");
      setStatusText("Microphone access denied");
    }
  };

  // End broadcast
  const endBroadcast = async () => {
    if (!confirm("Are you sure you want to end this stream?")) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=end`, { 
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        showAlert("Stream ended successfully!", "success");
        cleanup();
        setStatus("ended");
        setStatusText("Stream ended");
        setTimeout(() => onClose(), 1500);
      } else {
        showAlert("Failed to end stream", "danger");
      }
    } catch (error: any) {
      showAlert("Error ending stream: " + error.message, "danger");
    }
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pluginHandleRef.current) pluginHandleRef.current.hangup();
    if (janusRef.current) janusRef.current.destroy();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((track) => track.stop());
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (listenerIntervalRef.current) clearInterval(listenerIntervalRef.current);
    broadcastingRef.current = false;
    localStreamRef.current = null;
    janusRef.current = null;
    pluginHandleRef.current = null;
  }, []);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = muted; // Toggle: if muted, enable; if not muted, disable
        setMuted(!muted);
      }
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      cleanup();
      setMuted(true);
      setIsMinimized(false);
      setPosition({ top: 240, left: 1007 });
      setStatus("idle");
      setStatusText("Ready to broadcast");
      setListenerCount(0);
      setListeners([]);
      setDuration("00:00");
      setAlerts([]);
    }
  }, [open, cleanup]);

  // Log when Janus is loaded and room info is ready
  useEffect(() => {
    if (open && janusLoaded && roomId && liveStreamId) {
      console.log("Ready to broadcast:", { janusLoaded, roomId, liveStreamId, status });
    }
  }, [open, janusLoaded, roomId, liveStreamId, status]);

  // Check if Janus is already loaded (from cache or previous load)
  useEffect(() => {
    if (open && !janusLoaded) {
      // Check periodically if Janus became available
      const checkJanus = setInterval(() => {
        if (typeof window !== "undefined" && typeof (window as any).Janus !== "undefined") {
          console.log("Janus detected as already loaded");
          setJanusLoaded(true);
          clearInterval(checkJanus);
        }
      }, 500);
      
      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkJanus), 10000);
      
      return () => clearInterval(checkJanus);
    }
  }, [open, janusLoaded]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (status === "live") {
          setIsMinimized(true);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, status]);

  // Beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (broadcastingRef.current) {
        e.preventDefault();
        e.returnValue = "Stream is still live. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanup();
    };
  }, [cleanup]);

  // Drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;

      const modalWidth = 400;
      const modalHeight = isMinimized ? 64 : 577;
      const maxLeft = window.innerWidth - modalWidth;
      const maxTop = window.innerHeight - modalHeight;

      setPosition({
        left: Math.max(0, Math.min(newLeft, maxLeft)),
        top: Math.max(0, Math.min(newTop, maxTop)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

  if (!open) return null;

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    width: "400px",
    height: isMinimized ? "64px" : "577px",
    top: position.top,
    left: position.left,
    borderRadius: "8px",
    zIndex: 60,
    cursor: isDragging ? "grabbing" : "default",
  };

  const statusIndicatorClass = {
    idle: "bg-gray-400",
    connecting: "bg-yellow-400 animate-pulse",
    live: "bg-red-500 animate-pulse",
    ended: "bg-gray-400",
  };

  // Minimized state render
  if (isMinimized) {
    return (
      <>
        <Script 
          src="https://code.jquery.com/jquery-3.6.0.min.js" 
          strategy="lazyOnload"
          onLoad={() => console.log("jQuery loaded")}
        />
        <Script 
          src="https://webrtc.github.io/adapter/adapter-latest.js" 
          strategy="lazyOnload"
          onLoad={() => console.log("WebRTC adapter loaded")}
        />
        <Script
          src="https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js"
          strategy="lazyOnload"
          onLoad={() => {
            console.log("Janus library loaded");
            setJanusLoaded(true);
          }}
        />
        <div ref={modalRef} id="audio-modal-root" style={modalStyle} className="bg-white shadow-2xl overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8A1538] flex items-center justify-center relative">
                <Mic className="w-5 h-5 text-white" />
                {status === "live" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-[#231217]">{khotbaName}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${statusIndicatorClass[status]}`} />
                  <span>{status === "live" ? `Live • ${duration}` : statusText}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{listenerCount}</span>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-2 hover:bg-gray-50 rounded"
                aria-label="Expand"
              >
                <ChevronDown className="w-4 h-4 text-gray-600 transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Full modal render
  return (
    <>
      {/* Janus Scripts - load in sequence */}
      <Script 
        id="jquery-script"
        src="https://code.jquery.com/jquery-3.6.0.min.js" 
        strategy="lazyOnload"
        onLoad={() => console.log("jQuery loaded")}
      />
      <Script 
        id="adapter-script"
        src="https://webrtc.github.io/adapter/adapter-latest.js" 
        strategy="lazyOnload"
        onLoad={() => console.log("WebRTC adapter loaded")}
      />
      <Script
        id="janus-script"
        src="https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Janus library loaded");
          setJanusLoaded(true);
        }}
        onError={() => {
          console.error("Failed to load Janus library");
          showAlert("Failed to load streaming library", "danger");
        }}
      />

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/10" onClick={() => setIsMinimized(true)} />

      {/* Modal */}
      <div ref={modalRef} id="audio-modal-root" style={modalStyle} className="bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            {/* Left side: End button */}
            <div className="flex items-center gap-1">
              <button
                onClick={status === "live" ? endBroadcast : onClose}
                className="px-3 py-1 text-sm font-medium text-[#DC2626] hover:bg-red-50 rounded"
                aria-label="End"
              >
                End
              </button>
            </div>

            {/* Right side: icons */}
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 hover:bg-gray-50 rounded"
                aria-label="Audio settings"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setAudioSettingsAnchor(rect);
                  setIsAudioSettingsOpen(true);
                }}
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              <button
                className="p-1.5 hover:bg-gray-50 rounded"
                aria-label="Share"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setShareAnchor(rect);
                  setIsShareOpen(true);
                }}
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-1.5 hover:bg-gray-50 rounded" aria-label="Open in new window">
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-gray-50 rounded"
                aria-label="Minimize"
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Second row: Khotba NAME with edit icon */}
          <div className="flex items-center justify-start gap-2 mt-2">
            {isEditingName ? (
              <input
                type="text"
                value={khotbaName}
                onChange={(e) => setKhotbaName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                className="text-sm text-gray-700 font-medium border-b border-[#8A1538] outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">{khotbaName}</span>
                <button 
                  className="p-1 hover:bg-gray-50 rounded" 
                  aria-label="Edit name"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${statusIndicatorClass[status]}`} />
            <span className="text-xs text-gray-500">{statusText}</span>
            {status === "live" && (
              <span className="text-xs text-gray-400 ml-auto">{duration}</span>
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="px-4 py-2 space-y-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded-lg text-xs ${
                  alert.type === "success" ? "bg-green-100 text-green-700" :
                  alert.type === "danger" ? "bg-red-100 text-red-700" : 
                  "bg-blue-100 text-blue-700"
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Host Section */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden relative bg-gray-100 shrink-0">
              {preacherAvatar ? (
                <img src={preacherAvatar} alt="Host"  style={{ objectFit: "cover" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#8A1538] text-white text-lg font-medium">
                  {preacherName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#231217] truncate">{preacherName}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {muted ? (
                  <MicOff className="w-3 h-3 text-rose-500" />
                ) : (
                  <Mic className="w-3 h-3 text-green-500" />
                )}
                <span>Host</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="flex-1 flex flex-col px-4 py-2 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Listeners ({listenerCount})
            </span>
          </div>
          
          {listeners.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2">
              {listeners.map((listener) => (
                <div key={listener.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative bg-gray-100 shrink-0">
                    {listener.avatar ? (
                      <Image src={listener.avatar} alt={listener.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#8A1538] text-white text-xs font-medium">
                        {listener.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#231217] truncate">{listener.name}</div>
                    <div className="text-xs text-gray-400">Listening</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">No participants yet</div>
                <div className="text-xs text-gray-400">Invite people to join</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Mic Button */}
            <button
              onClick={toggleMute}
              disabled={status !== "live"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                status === "live" 
                  ? muted 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-[#7A1233] hover:bg-[#6d1029]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Center: Start button (only when not live) */}
            {status === "idle" && (
              <button
                onClick={startBroadcast}
                disabled={!janusLoaded || !roomId || !liveStreamId}
                className="flex-1 py-3 bg-[#7A1233] hover:bg-[#6d1029] text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!janusLoaded 
                  ? "Loading..." 
                  : (!roomId || !liveStreamId) 
                    ? "Loading room info..." 
                    : "Start Broadcasting"}
              </button>
            )}

            {status === "connecting" && (
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-500">Connecting...</span>
              </div>
            )}

            {status === "live" && <div className="flex-1" />}

            {/* Right side: User icon with count */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-[#231217]">{listenerCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio settings popup */}
      <AudioSettingsModal
        open={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        anchorRect={audioSettingsAnchor}
        onOpenAudioModal={() => {
          setIsAudioSettingsOpen(false);
          setIsLiveSettingsOpen(true);
        }}
      />

      {/* Live settings full screen modal */}
      <LiveSettings
        open={isLiveSettingsOpen}
        onClose={() => setIsLiveSettingsOpen(false)}
      />

      {/* Share popup */}
      <ShareModal open={isShareOpen} onClose={() => setIsShareOpen(false)} anchorRect={shareAnchor} />
    </>
  );
}
