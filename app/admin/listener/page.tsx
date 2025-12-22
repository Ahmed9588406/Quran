"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

// Use environment variable or fallback to hardcoded value
const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
// Use local proxy to avoid CORS issues with backend API
const BACKEND_BASE = "/api/admin/stream";

declare const Janus: any;

export default function ListenerPage() {
  const searchParams = useSearchParams();
  const roomId = parseInt(searchParams.get("roomId") || "0");
  const liveStreamId = parseInt(searchParams.get("liveStreamId") || "0") || roomId;
  const userIdRef = useRef(Math.floor(Math.random() * 1000000));

  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "ended">("connecting");
  const [statusText, setStatusText] = useState("Connecting...");
  const [listenerCount, setListenerCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: string }[]>([]);
  const [janusLoaded, setJanusLoaded] = useState(false);

  const janusRef = useRef<any>(null);
  const discoveryHandleRef = useRef<any>(null);
  const subscribedRef = useRef(false);
  const streamCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const showAlert = useCallback((message: string, type: string) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 5000);
  }, []);

  // Notify backend when user joins
  const notifyJoin = useCallback(async () => {
    try {
      await fetch(`${BACKEND_BASE}/${liveStreamId}?action=join&userId=${userIdRef.current}`, { method: "POST" });
      console.log("Notified backend: user joined");
    } catch (err) {
      console.error("Failed to notify join:", err);
    }
  }, [liveStreamId]);

  // Notify backend when user leaves
  const notifyLeave = useCallback(async () => {
    try {
      await fetch(`${BACKEND_BASE}/${liveStreamId}?action=leave&userId=${userIdRef.current}`, { method: "POST" });
      console.log("Notified backend: user left");
    } catch (err) {
      console.error("Failed to notify leave:", err);
    }
  }, [liveStreamId]);

  // Handle stream ended
  const handleStreamEnded = useCallback((views: number) => {
    setStatus("ended");
    setStatusText("Stream Ended");
    setTotalViews(views || 0);
    setShowAudioPlayer(false);
    setShowPlayButton(false);
    showAlert("The broadcaster has ended this stream", "warning");
    
    if (streamCheckIntervalRef.current) {
      clearInterval(streamCheckIntervalRef.current);
      streamCheckIntervalRef.current = null;
    }
    
    if (janusRef.current) {
      janusRef.current.destroy();
      janusRef.current = null;
    }
    
    notifyLeave();
  }, [showAlert, notifyLeave]);

  // Check stream status from backend
  const checkStreamStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=info`);
      if (!response.ok) {
        console.warn("Stream status check failed with status:", response.status);
        return true; // Assume still active
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Failed to parse stream status response:", text.substring(0, 100));
        return true; // Assume still active
      }
      
      if (data.status === "ENDED") {
        handleStreamEnded(data.totalViews);
        return false;
      }
      
      setListenerCount(data.listenerCount || 0);
      return true;
    } catch (error) {
      console.error("Error checking stream status:", error);
      return true; // Assume still active on error
    }
  }, [liveStreamId, handleStreamEnded]);

  // Attach remote stream to audio element
  const attachRemoteStreamToAudio = useCallback((stream: MediaStream) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    
    audioEl.srcObject = stream;
    console.log("Attached stream to audio element");
    setShowAudioPlayer(true);

    audioEl.play().then(() => {
      try {
        audioEl.muted = false;
        setStatus("live");
        setStatusText("🎶 Playing live audio");
        showAlert("Connected to live stream!", "success");
      } catch (e) {
        console.warn("Could not unmute:", e);
        setShowPlayButton(true);
      }
    }).catch((err) => {
      console.warn("Autoplay prevented:", err);
      setStatus("live");
      setStatusText("Ready to play");
      showAlert("Click the button below to start audio", "info");
      setShowPlayButton(true);
    });
  }, [showAlert]);

  // Subscribe to a publisher feed
  const subscribeToFeed = useCallback((feedId: number) => {
    if (subscribedRef.current || !janusRef.current) return;
    
    console.log("Subscribing to feed:", feedId);
    
    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: function (subHandle: any) {
        console.log("Subscriber handle attached:", subHandle.getId());

        const subReq = {
          request: "join",
          room: roomId,
          ptype: "subscriber",
          feed: feedId,
          offer_audio: true,
          offer_video: false
        };
        subHandle.send({ message: subReq });

        subHandle.onmessage = function (msg: any, jsep: any) {
          console.log("Subscriber onmessage:", msg);
          if (jsep) {
            subHandle.createAnswer({
              jsep: jsep,
              media: {
                audioSend: false,
                videoSend: false,
                audioRecv: true,
                videoRecv: false
              },
              success: function (jsepAnswer: any) {
                console.log("Subscriber created answer, sending start");
                subHandle.send({ message: { request: "start" }, jsep: jsepAnswer });
              },
              error: function (err: any) {
                console.error("createAnswer error:", err);
                setStatus("idle");
                setStatusText("Connection error");
                showAlert("Failed to receive stream", "danger");
              }
            });
          }
        };

        subHandle.onremotestream = function (stream: MediaStream) {
          console.log("Subscriber got remote stream:", stream);
          attachRemoteStreamToAudio(stream);
          subscribedRef.current = true;
        };

        subHandle.onremotetrack = function (track: MediaStreamTrack, mid: string, on: boolean) {
          console.log("Subscriber onremotetrack:", track, mid, on);
          if (track && track.kind === "audio" && on) {
            const stream = new MediaStream([track]);
            attachRemoteStreamToAudio(stream);
            subscribedRef.current = true;
          }
        };

        subHandle.oncleanup = function () {
          console.log("Subscriber cleaned up");
        };
      },
      error: function (err: any) {
        console.error("Subscriber attach error:", err);
        setStatus("idle");
        setStatusText("Failed to subscribe");
        showAlert("Error subscribing to stream", "danger");
      }
    });
  }, [roomId, showAlert, attachRemoteStreamToAudio]);

  // Attach discovery handle to find publishers
  const attachDiscoveryHandle = useCallback(() => {
    if (!janusRef.current) return;
    
    setStatusText("Joining room...");
    setStatus("connecting");
    
    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: function (handle: any) {
        discoveryHandleRef.current = handle;
        console.log("Discovery handle attached:", handle.getId());

        const joinReq = {
          request: "join",
          room: roomId,
          ptype: "publisher",
          display: "Listener",
          audio: false,
          video: false
        };
        handle.send({ message: joinReq });
        setStatusText("Waiting for broadcaster...");
      },
      error: function (err: any) {
        console.error("Discovery attach error:", err);
        setStatus("idle");
        setStatusText("Failed to join");
        showAlert("Error joining room", "danger");
      },
      onmessage: function (msg: any, jsep: any) {
        console.log("Discovery handle onmessage:", msg);

        let publishers: any[] = [];
        if (Array.isArray(msg.publishers)) {
          publishers = msg.publishers;
        } else if (msg.plugindata?.data?.publishers) {
          publishers = msg.plugindata.data.publishers;
        } else if (Array.isArray(msg.participants)) {
          publishers = msg.participants.filter((p: any) => p.publisher);
        }

        if (publishers && publishers.length > 0) {
          const feedId = publishers[0].id;
          console.log("Found publisher feed:", feedId);
          setStatusText("Connecting to stream...");
          subscribeToFeed(feedId);
        } else {
          setStatusText("Waiting for broadcaster...");
        }
      },
      oncleanup: function () {
        console.log("Discovery handle cleaned up");
      }
    });
  }, [roomId, showAlert, subscribeToFeed]);

  // Start Janus connection
  const startJanus = useCallback(() => {
    setStatusText("Connecting to server...");
    setStatus("connecting");
    
    console.log("Initializing Janus with server:", JANUS_SERVER);
    
    Janus.init({
      debug: "all",
      callback: function () {
        console.log("Janus initialized, creating session...");
        janusRef.current = new Janus({
          server: JANUS_SERVER,
          success: function () {
            console.log("Janus session created successfully");
            attachDiscoveryHandle();
          },
          error: function (err: any) {
            console.error("Janus error:", err);
            setStatus("idle");
            setStatusText("Connection error");
            showAlert("Failed to connect to stream server: " + err, "danger");
          },
          destroyed: function () {
            console.log("Janus session destroyed");
          }
        });
      }
    });
  }, [attachDiscoveryHandle, showAlert]);

  // Initialize the listener
  const initialize = useCallback(async () => {
    if (!roomId || !liveStreamId) {
      showAlert("Missing room ID or stream ID in URL", "danger");
      setStatus("idle");
      setStatusText("Configuration error");
      return;
    }

    console.log("Initializing listener for room:", roomId, "stream:", liveStreamId);

    // Check if stream is still active
    const isActive = await checkStreamStatus();
    if (!isActive) {
      return;
    }

    // Notify backend that user joined
    notifyJoin();
    
    // Start Janus connection
    startJanus();

    // Start polling for stream status
    streamCheckIntervalRef.current = setInterval(async () => {
      const active = await checkStreamStatus();
      if (!active && streamCheckIntervalRef.current) {
        clearInterval(streamCheckIntervalRef.current);
        streamCheckIntervalRef.current = null;
      }
    }, 5000);
  }, [roomId, liveStreamId, checkStreamStatus, notifyJoin, startJanus, showAlert]);

  // Initialize when Janus is loaded
  useEffect(() => {
    if (janusLoaded) {
      initialize();
    }
  }, [janusLoaded, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notifyLeave();
      if (streamCheckIntervalRef.current) {
        clearInterval(streamCheckIntervalRef.current);
      }
      if (janusRef.current) {
        janusRef.current.destroy();
      }
    };
  }, [notifyLeave]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      notifyLeave();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [notifyLeave]);

  // Manual play button handler
  const manualPlay = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    
    audioEl.muted = false;
    audioEl.volume = 1;
    audioEl.play().then(() => {
      setStatus("live");
      setStatusText("🎶 Playing live audio");
      showAlert("Audio started!", "success");
      setShowPlayButton(false);
    }).catch((err) => {
      console.error("Manual play error:", err);
      showAlert("Failed to play audio: " + err.message, "danger");
    });
  };

  const statusIndicatorClass = {
    idle: "bg-gray-400",
    connecting: "bg-yellow-400 animate-pulse",
    live: "bg-green-500 animate-pulse",
    ended: "bg-red-500",
  };

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="https://webrtc.github.io/adapter/adapter-latest.js" strategy="beforeInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Janus script loaded");
          setJanusLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Janus script:", e);
          showAlert("Failed to load streaming library", "danger");
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <span className="text-5xl">🎧</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-3">Live Stream</h1>
            <p className="text-gray-500">
              Room ID: <strong className="text-indigo-600">{roomId || "Missing"}</strong>
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${statusIndicatorClass[status]}`} />
              <span className="text-lg font-semibold text-gray-800">{statusText}</span>
            </div>
          </div>

          {/* Listener Count - Only show when not ended */}
          {status !== "ended" && (
            <div className="bg-gray-50 rounded-xl p-4 text-center mb-6">
              <p className="text-xs text-gray-500 mb-1">Current Listeners</p>
              <p className="text-3xl font-bold text-indigo-600">{listenerCount}</p>
            </div>
          )}

          {/* Alerts */}
          <div className="space-y-2 mb-6">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg text-sm ${
                  alert.type === "success" ? "bg-green-100 text-green-700" :
                  alert.type === "danger" ? "bg-red-100 text-red-700" :
                  alert.type === "warning" ? "bg-yellow-100 text-yellow-700" :
                  "bg-blue-100 text-blue-700"
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>

          {/* Audio Player */}
          {showAudioPlayer && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <audio ref={audioRef} autoPlay playsInline controls className="w-full" />
            </div>
          )}

          {/* Hidden audio element for when player is not shown */}
          {!showAudioPlayer && <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />}

          {/* Play Button */}
          {showPlayButton && (
            <button
              onClick={manualPlay}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              🔊 Unmute & Play Audio
            </button>
          )}

          {/* Stream Ended */}
          {status === "ended" && (
            <div className="text-center py-8">
              <span className="text-5xl block mb-4">📡</span>
              <h2 className="text-xl font-bold text-red-600 mb-2">Stream Ended</h2>
              <p className="text-gray-500">This live stream has ended.</p>
              <p className="text-gray-600 mt-4">
                Total Views: <strong className="text-indigo-600">{totalViews}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
