"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mic, MicOff, Users, Square, X, RefreshCw, ArrowLeft, Shield } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Backend API URLs
// Janus server - use local IP for development, or set NEXT_PUBLIC_JANUS_SERVER env var
const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
const PROXY_BASE = "/api/stream"; // Use local proxy to avoid CORS

interface JanusHandle {
  getId: () => number;
  send: (params: { message: object; jsep?: RTCSessionDescriptionInit }) => void;
  createOffer: (params: {
    media: { audio: boolean; video: boolean };
    stream?: MediaStream;
    success: (jsep: RTCSessionDescriptionInit) => void;
    error: (err: Error) => void;
  }) => void;
  handleRemoteJsep: (params: { jsep: RTCSessionDescriptionInit }) => void;
  hangup: () => void;
}

interface JanusInstance {
  attach: (params: {
    plugin: string;
    success: (handle: JanusHandle) => void;
    error: (err: Error) => void;
    onmessage?: (msg: any, jsep?: RTCSessionDescriptionInit) => void;
  }) => void;
  destroy: () => void;
}

// Use any for window.Janus to avoid type conflicts with dynamically loaded library
/* eslint-disable @typescript-eslint/no-explicit-any */
const getJanus = (): any => (window as any).Janus;

export default function BroadcastPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomId = parseInt(searchParams.get("roomId") || "0");
  const liveStreamId = parseInt(searchParams.get("liveStreamId") || "0");

  const [status, setStatus] = useState<"idle" | "requesting-permission" | "permission-denied" | "connecting" | "live">("idle");
  const [listenerCount, setListenerCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [permissionError, setPermissionError] = useState<string>("");

  const janusRef = useRef<JanusInstance | null>(null);
  const pluginHandleRef = useRef<JanusHandle | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const listenerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (listenerIntervalRef.current) clearInterval(listenerIntervalRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (pluginHandleRef.current) {
      pluginHandleRef.current.hangup();
    }
    if (janusRef.current) {
      janusRef.current.destroy();
    }
    janusRef.current = null;
    pluginHandleRef.current = null;
    localStreamRef.current = null;
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    // Fetch room info
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`${PROXY_BASE}/${liveStreamId}/info`);
        const data = await response.json();
        setRoomTitle(data.title || `Room #${roomId}`);
      } catch (error) {
        console.error("Failed to fetch room info:", error);
      }
    };

    if (liveStreamId) {
      fetchRoomInfo();
    }

    return cleanup;
  }, [liveStreamId, roomId, cleanup]);

  // Warn user before leaving during live broadcast
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "live") {
        e.preventDefault();
        e.returnValue = "Stream is still live. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  const loadJanusScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (getJanus()) {
        resolve();
        return;
      }
      
      // Load adapter.js first
      const adapterScript = document.createElement("script");
      adapterScript.src = "https://webrtc.github.io/adapter/adapter-latest.js";
      adapterScript.async = true;
      adapterScript.onload = () => {
        // Then load Janus
        const janusScript = document.createElement("script");
        janusScript.src = "https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js";
        janusScript.async = true;
        janusScript.onload = () => resolve();
        janusScript.onerror = reject;
        document.head.appendChild(janusScript);
      };
      adapterScript.onerror = reject;
      document.head.appendChild(adapterScript);
    });
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      setStatus("requesting-permission");
      setPermissionError("");
      
      // Request microphone access
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      toast.success("Microphone access granted!");
      return true;
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      
      let errorMessage = "Microphone access was denied.";
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Microphone permission was denied. Please allow microphone access in your browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage = "No microphone found. Please connect a microphone and try again.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMessage = "Microphone is being used by another application. Please close other apps using the microphone.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Microphone constraints could not be satisfied.";
      } else if (err.name === "SecurityError") {
        errorMessage = "Microphone access is blocked due to security settings. Please use HTTPS.";
      }
      
      setPermissionError(errorMessage);
      setStatus("permission-denied");
      toast.error(errorMessage);
      return false;
    }
  };

  const startBroadcast = async () => {
    if (!roomId || !liveStreamId) {
      toast.error("Missing room ID or stream ID");
      return;
    }

    // First request microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    try {
      setStatus("connecting");

      // Load Janus scripts
      await loadJanusScript();

      // Initialize Janus
      const Janus = getJanus();
      Janus.init({
        debug: "all",
        callback: () => {
          janusRef.current = new Janus({
            server: JANUS_SERVER,
            success: () => attachPlugin(),
            error: (err: Error) => {
              console.error("Janus error:", err);
              toast.error("Failed to connect to streaming server");
              setStatus("idle");
            },
            destroyed: () => setStatus("idle"),
          });
        },
      });
    } catch (err) {
      console.error("Broadcast error:", err);
      toast.error("Failed to start broadcast");
      setStatus("idle");
    }
  };

  const retryPermission = () => {
    setStatus("idle");
    setPermissionError("");
  };

  const attachPlugin = () => {
    if (!janusRef.current) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (handle) => {
        pluginHandleRef.current = handle;
        joinRoomAsPublisher();
      },
      error: (err) => {
        console.error("Plugin error:", err);
        toast.error("Failed to join room");
        setStatus("idle");
      },
      onmessage: (msg, jsep) => {
        const event = msg["videoroom"];

        if (event === "joined") {
          pluginHandleRef.current?.createOffer({
            media: { audio: true, video: false },
            stream: localStreamRef.current!,
            success: (jsep) => {
              pluginHandleRef.current?.send({
                message: { request: "publish", audio: true, video: false },
                jsep,
              });
            },
            error: (err) => {
              console.error("Offer error:", err);
              toast.error("Failed to start broadcast");
              setStatus("idle");
            },
          });
        } else if (event === "event" && msg["configured"] === "ok") {
          setStatus("live");
          startTimeRef.current = Date.now();
          toast.success("You are now LIVE!");
          startDurationCounter();
          startListenerPolling();
        }

        if (jsep) {
          pluginHandleRef.current?.handleRemoteJsep({ jsep });
        }
      },
    });
  };

  const joinRoomAsPublisher = () => {
    if (!pluginHandleRef.current) return;

    pluginHandleRef.current.send({
      message: {
        request: "join",
        room: roomId,
        ptype: "publisher",
        display: "Admin Broadcaster",
      },
    });
  };

  const startDurationCounter = () => {
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  };

  const startListenerPolling = () => {
    listenerIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${PROXY_BASE}/${liveStreamId}/listeners`);
        const data = await response.json();
        setListenerCount(data.listeners || 0);
      } catch (error) {
        console.error("Error polling listeners:", error);
      }
    }, 3000);
  };

  const endBroadcast = async () => {
    if (!confirm("Are you sure you want to end this stream?")) return;

    try {
      const response = await fetch(`${PROXY_BASE}/${liveStreamId}/end`, { method: "POST" });
      const data = await response.json();

      if (data.success) {
        toast.success("Stream ended successfully!");
        cleanup();
        setStatus("idle");
        setDuration(0);
        setListenerCount(0);
      } else {
        toast.error("Failed to end stream");
      }
    } catch (error) {
      toast.error("Error ending stream");
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!roomId || !liveStreamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8A1538] to-[#6d1029] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Invalid Configuration</h1>
          <p className="text-gray-600 mb-4">Missing room ID or stream ID in URL parameters.</p>
          <button
            onClick={() => router.push("/admin")}
            className="px-6 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029]"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8A1538] to-[#6d1029] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/admin")}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-semibold">🎤 Live Broadcasting</h1>
              <p className="text-sm text-white/80">{roomTitle || `Room #${roomId}`}</p>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Permission Denied State */}
          {status === "permission-denied" && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Microphone Access Required</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-sm mx-auto">
                {permissionError || "To broadcast live audio, you need to allow microphone access."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={retryPermission}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
                >
                  <Mic className="w-5 h-5" />
                  Try Again
                </button>
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-1">How to enable microphone:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Click the lock/info icon in your browser's address bar</li>
                    <li>Find "Microphone" in the permissions list</li>
                    <li>Change it to "Allow"</li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Requesting Permission State */}
          {status === "requesting-permission" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Requesting Microphone Access</h3>
              <p className="text-gray-600 text-sm">
                Please allow microphone access when prompted by your browser.
              </p>
            </div>
          )}

          {/* Normal States */}
          {status !== "permission-denied" && status !== "requesting-permission" && (
            <>
              {/* Status */}
              <div className="flex items-center justify-center py-4">
                <div
                  className={`w-4 h-4 rounded-full mr-3 ${
                    status === "live"
                      ? "bg-red-500 animate-pulse"
                      : status === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                <span className="text-lg font-medium text-[#231217]">
                  {status === "live"
                    ? "🔴 LIVE - Broadcasting"
                    : status === "connecting"
                    ? "Connecting..."
                    : "Ready to broadcast"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFF9F3] rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-[#8A1538]" />
                  <p className="text-2xl font-bold text-[#8A1538]">{listenerCount}</p>
                  <p className="text-sm text-gray-500">Listeners</p>
                </div>
                <div className="bg-[#FFF9F3] rounded-xl p-4 text-center">
                  <Mic className="w-6 h-6 mx-auto mb-2 text-[#8A1538]" />
                  <p className="text-2xl font-bold text-[#8A1538]">{formatDuration(duration)}</p>
                  <p className="text-sm text-gray-500">Duration</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {status === "idle" ? (
                  <button
                    onClick={startBroadcast}
                    className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors text-lg"
                  >
                    <Mic className="w-6 h-6" />
                    Start Broadcasting
                  </button>
                ) : status === "live" ? (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`h-14 px-6 rounded-xl font-medium transition-colors ${
                        isMuted
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={endBroadcast}
                      className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors text-lg"
                    >
                      <Square className="w-6 h-6" />
                      End Stream
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-14 rounded-xl bg-yellow-100 text-yellow-700">
                    <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                    Connecting...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
