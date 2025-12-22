"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

// Use environment variable or fallback to hardcoded value
const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
// Use local proxy to avoid CORS issues with backend API
const BACKEND_BASE = "/api/admin/stream";

declare const Janus: any;

export default function BroadcasterPage() {
  const searchParams = useSearchParams();
  const roomId = parseInt(searchParams.get("roomId") || "0");
  const liveStreamId = parseInt(searchParams.get("liveStreamId") || "0");

  const [status, setStatus] = useState<"idle" | "connecting" | "live">("idle");
  const [statusText, setStatusText] = useState("Ready to broadcast");
  const [listenerCount, setListenerCount] = useState(0);
  const [duration, setDuration] = useState("00:00");
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: string }[]>([]);
  const [janusLoaded, setJanusLoaded] = useState(false);

  const janusRef = useRef<any>(null);
  const pluginHandleRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const listenerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback((message: string, type: string) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 5000);
  }, []);

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

  const startListenerPolling = useCallback(() => {
    listenerIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=listeners`);
        if (!response.ok) {
          console.warn("Listener poll failed with status:", response.status);
          return;
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setListenerCount(data.listeners || 0);
        } catch {
          console.warn("Failed to parse listener response:", text.substring(0, 100));
        }
      } catch (error) {
        console.error("Error polling listeners:", error);
      }
    }, 3000);
  }, [liveStreamId]);

  const attachPlugin = useCallback(() => {
    setStatusText("Joining room...");
    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (handle: any) => {
        pluginHandleRef.current = handle;
        const join = { request: "join", room: roomId, ptype: "publisher", display: "Broadcaster" };
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
          setStatusText("🔴 LIVE - Broadcasting");
          showAlert("You are now LIVE!", "success");
          startDurationCounter();
          startListenerPolling();
        }
        if (jsep) pluginHandleRef.current.handleRemoteJsep({ jsep });
      },
    });
  }, [roomId, showAlert, startDurationCounter, startListenerPolling]);

  const startJanus = useCallback(() => {
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

  const startBroadcast = async () => {
    if (!roomId || !liveStreamId) {
      showAlert("Missing room ID or stream ID in URL", "danger");
      return;
    }
    try {
      setStatus("connecting");
      setStatusText("Requesting microphone access...");
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      showAlert("Microphone ready!", "success");
      startJanus();
    } catch (err) {
      console.error(err);
      showAlert("Microphone permission denied", "danger");
      setStatus("idle");
      setStatusText("Microphone access denied");
    }
  };

  const endBroadcast = async () => {
    if (!confirm("Are you sure you want to end this stream?")) return;
    try {
      const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=end`, { method: "POST" });
      const data = await response.json();
      if (data.success) {
        showAlert("Stream ended successfully!", "success");
        if (pluginHandleRef.current) pluginHandleRef.current.hangup();
        if (janusRef.current) janusRef.current.destroy();
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach((track) => track.stop());
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        if (listenerIntervalRef.current) clearInterval(listenerIntervalRef.current);
        broadcastingRef.current = false;
        setStatus("idle");
        setStatusText("Stream ended");
      } else {
        showAlert("Failed to end stream", "danger");
      }
    } catch (error: any) {
      showAlert("Error ending stream: " + error.message, "danger");
    }
  };

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
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (listenerIntervalRef.current) clearInterval(listenerIntervalRef.current);
    };
  }, []);

  const statusIndicatorClass = {
    idle: "bg-gray-400",
    connecting: "bg-yellow-400 animate-pulse",
    live: "bg-green-500 animate-pulse",
  };

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="https://webrtc.github.io/adapter/adapter-latest.js" strategy="beforeInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js"
        strategy="afterInteractive"
        onLoad={() => setJanusLoaded(true)}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <span className="text-5xl">🎤</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-3">Live Broadcasting</h1>
            <p className="text-gray-500">Room ID: <strong className="text-indigo-600">{roomId || "Missing"}</strong></p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${statusIndicatorClass[status]}`} />
              <span className="text-lg font-semibold text-gray-800">{statusText}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Listeners</p>
              <p className="text-3xl font-bold text-indigo-600">{listenerCount}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="text-3xl font-bold text-indigo-600">{duration}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg text-sm ${
                alert.type === "success" ? "bg-green-100 text-green-700" :
                alert.type === "danger" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}>
                {alert.message}
              </div>
            ))}
          </div>

          {status !== "live" ? (
            <button
              onClick={startBroadcast}
              disabled={!janusLoaded || status === "connecting"}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {status === "connecting" ? "Connecting..." : "Start Broadcasting"}
            </button>
          ) : (
            <button
              onClick={endBroadcast}
              className="w-full py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              End Stream
            </button>
          )}
        </div>
      </div>
    </>
  );
}
