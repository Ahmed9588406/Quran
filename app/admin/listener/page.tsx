/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
const BACKEND_BASE = "/api/admin/stream";

declare const Janus: any;

function ListenerPageInner() {
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const janusRef = useRef<any>(null);
  const discoveryHandleRef = useRef<any>(null);
  const subscribedRef = useRef(false);
  const streamCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const showAlert = useCallback((message: string, type: string) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 5000);
  }, []);

  // Audio visualization
  const startVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      // Draw audio bars
      const barCount = 64;
      const barWidth = width / barCount - 2;
      const barSpacing = 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * height * 0.8;
        
        const x = i * (barWidth + barSpacing);
        const y = height - barHeight;

        // Gradient colors matching burgundy theme
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, "#8A1538"); // burgundy
        gradient.addColorStop(0.5, "#a81c47"); // lighter burgundy
        gradient.addColorStop(1, "#6d1029"); // darker burgundy

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();
  }, []);

  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      startVisualization();
    } catch (err) {
      console.error("Failed to setup audio analyser:", err);
    }
  }, [startVisualization]);

  const notifyJoin = useCallback(async () => {
    try {
      await fetch(`${BACKEND_BASE}/${liveStreamId}?action=join&userId=${userIdRef.current}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify join:", err);
    }
  }, [liveStreamId]);

  const notifyLeave = useCallback(async () => {
    try {
      await fetch(`${BACKEND_BASE}/${liveStreamId}?action=leave&userId=${userIdRef.current}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify leave:", err);
    }
  }, [liveStreamId]);

  const handleStreamEnded = useCallback((views: number) => {
    setStatus("ended");
    setStatusText("Stream Ended");
    setTotalViews(views || 0);
    setShowAudioPlayer(false);
    setShowPlayButton(false);
    showAlert("The broadcaster has ended this stream", "warning");
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
    if (janusRef.current) janusRef.current.destroy();
    notifyLeave();
  }, [showAlert, notifyLeave]);

  const checkStreamStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=info`);
      if (!response.ok) return true;
      const data = await response.json();
      
      if (data.status === "ENDED") {
        handleStreamEnded(data.totalViews);
        return false;
      }
      setListenerCount(data.listenerCount || 0);
      return true;
    } catch {
      return true;
    }
  }, [liveStreamId, handleStreamEnded]);

  const attachRemoteStreamToAudio = useCallback((stream: MediaStream) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    
    audioEl.srcObject = stream;
    setShowAudioPlayer(true);
    setupAudioAnalyser(stream);

    audioEl.play().then(() => {
      audioEl.muted = false;
      setStatus("live");
      setStatusText("Playing live audio");
      showAlert("Connected to live stream!", "success");
    }).catch(() => {
      setStatus("live");
      setStatusText("Ready to play");
      showAlert("Click play to start audio", "info");
      setShowPlayButton(true);
    });
  }, [showAlert, setupAudioAnalyser]);

  const subscribeToFeed = useCallback((feedId: number) => {
    if (subscribedRef.current || !janusRef.current) return;
    
    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: function (subHandle: any) {
        subHandle.send({ message: { request: "join", room: roomId, ptype: "subscriber", feed: feedId, offer_audio: true, offer_video: false } });

        subHandle.onmessage = function (msg: any, jsep: any) {
          if (jsep) {
            subHandle.createAnswer({
              jsep,
              media: { audioSend: false, videoSend: false, audioRecv: true, videoRecv: false },
              success: function (jsepAnswer: any) {
                subHandle.send({ message: { request: "start" }, jsep: jsepAnswer });
              },
              error: function () {
                setStatus("idle");
                setStatusText("Connection error");
                showAlert("Failed to receive stream", "danger");
              }
            });
          }
        };

        subHandle.onremotestream = function (stream: MediaStream) {
          attachRemoteStreamToAudio(stream);
          subscribedRef.current = true;
        };

        subHandle.onremotetrack = function (track: MediaStreamTrack, _mid: string, on: boolean) {
          if (track?.kind === "audio" && on) {
            attachRemoteStreamToAudio(new MediaStream([track]));
            subscribedRef.current = true;
          }
        };
      },
      error: function () {
        setStatus("idle");
        setStatusText("Failed to subscribe");
        showAlert("Error subscribing to stream", "danger");
      }
    });
  }, [roomId, showAlert, attachRemoteStreamToAudio]);

  const attachDiscoveryHandle = useCallback(() => {
    if (!janusRef.current) return;
    setStatusText("Joining room...");
    
    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: function (handle: any) {
        discoveryHandleRef.current = handle;
        handle.send({ message: { request: "join", room: roomId, ptype: "publisher", display: "Listener", audio: false, video: false } });
        setStatusText("Waiting for broadcaster...");
      },
      error: function () {
        setStatus("idle");
        setStatusText("Failed to join");
        showAlert("Error joining room", "danger");
      },
      onmessage: function (msg: any) {
        const publishers = msg.publishers || msg.plugindata?.data?.publishers || msg.participants?.filter((p: any) => p.publisher) || [];
        if (publishers.length > 0) {
          setStatusText("Connecting to stream...");
          subscribeToFeed(publishers[0].id);
        }
      }
    });
  }, [roomId, showAlert, subscribeToFeed]);

  const startJanus = useCallback(() => {
    setStatusText("Connecting to server...");
    
    Janus.init({
      debug: "all",
      callback: function () {
        janusRef.current = new Janus({
          server: JANUS_SERVER,
          success: function () { attachDiscoveryHandle(); },
          error: function (err: any) {
            setStatus("idle");
            setStatusText("Connection error");
            showAlert("Failed to connect: " + err, "danger");
          }
        });
      }
    });
  }, [attachDiscoveryHandle, showAlert]);

  const initialize = useCallback(async () => {
    if (!roomId || !liveStreamId) {
      showAlert("Missing room ID or stream ID", "danger");
      setStatus("idle");
      return;
    }

    const isActive = await checkStreamStatus();
    if (!isActive) return;

    notifyJoin();
    startJanus();

    streamCheckIntervalRef.current = setInterval(async () => {
      const active = await checkStreamStatus();
      if (!active && streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
    }, 5000);
  }, [roomId, liveStreamId, checkStreamStatus, notifyJoin, startJanus, showAlert]);

  useEffect(() => { if (janusLoaded) initialize(); }, [janusLoaded, initialize]);

  useEffect(() => {
    return () => {
      notifyLeave();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
      if (janusRef.current) janusRef.current.destroy();
    };
  }, [notifyLeave]);

  useEffect(() => {
    const handleBeforeUnload = () => notifyLeave();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [notifyLeave]);

  const manualPlay = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.muted = false;
    audioEl.volume = volume;
    audioEl.play().then(() => {
      setStatus("live");
      setStatusText("Playing live audio");
      showAlert("Audio started!", "success");
      setShowPlayButton(false);
    }).catch((err) => showAlert("Failed to play: " + err.message, "danger"));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="https://webrtc.github.io/adapter/adapter-latest.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js" strategy="afterInteractive"
        onLoad={() => setJanusLoaded(true)}
        onError={() => showAlert("Failed to load streaming library", "danger")}
      />

      <div className="min-h-screen bg-gray-50 text-gray-800 relative overflow-hidden">

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Main Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#8A1538]/10 rounded-3xl blur-xl" />
              
              <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 text-center border-b border-gray-200">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#8A1538] to-[#6d1029] flex items-center justify-center shadow-lg shadow-[#8A1538]/30 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-800">Live Stream</h1>
                  <p className="text-sm text-gray-600 mt-1">Room <span className="text-[#8A1538] font-medium">{roomId || "—"}</span></p>
                </div>

                {/* Status */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gray-50 border border-gray-200">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === "live" ? "bg-[#8A1538] animate-pulse shadow-lg shadow-[#8A1538]/50" :
                      status === "connecting" ? "bg-amber-500 animate-pulse" :
                      status === "ended" ? "bg-red-500" : "bg-gray-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      status === "live" ? "text-[#8A1538]" :
                      status === "connecting" ? "text-amber-600" :
                      status === "ended" ? "text-red-600" : "text-gray-600"
                    }`}>{statusText}</span>
                  </div>
                </div>

                {/* Audio Visualizer */}
                {status === "live" && showAudioPlayer && (
                  <div className="px-6 pb-4">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 overflow-hidden">
                      <canvas ref={canvasRef} width={320} height={80} className="w-full h-20" />
                    </div>
                  </div>
                )}

                {/* Listener Count */}
                {status !== "ended" && (
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">Listeners</span>
                      </div>
                      <span className="text-2xl font-bold text-[#8A1538]">{listenerCount}</span>
                    </div>
                  </div>
                )}

                {/* Volume Control */}
                {status === "live" && showAudioPlayer && (
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-gray-50 border border-gray-200">
                      <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        {isMuted ? (
                          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                      <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                        className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8A1538] [&::-webkit-slider-thumb]:shadow-lg"
                      />
                      <span className="text-xs text-gray-600 w-8 text-right">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="px-6 pb-4 space-y-2">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                        alert.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        alert.type === "danger" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        alert.type === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        {alert.type === "success" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        {alert.type === "danger" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        {alert.type === "warning" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        {alert.type === "info" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Play Button */}
                {showPlayButton && (
                  <div className="px-6 pb-6">
                    <button onClick={manualPlay} className="w-full py-4 rounded-xl font-medium text-white bg-[#8A1538] hover:bg-[#6d1029] transition-all shadow-lg flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Play Audio
                    </button>
                  </div>
                )}

                {/* Stream Ended */}
                {status === "ended" && (
                  <div className="px-6 pb-6 text-center">
                    <div className="py-8">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <h2 className="text-lg font-semibold text-red-600 mb-2">Stream Ended</h2>
                      <p className="text-gray-600 text-sm mb-4">This live stream has ended</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
                        <svg className="w-4 h-4 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">Total Views: <span className="font-semibold text-[#8A1538]">{totalViews}</span></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden Audio Element */}
                <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-xs mt-6">Mosque Live Streaming</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ListenerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ListenerPageInner />
    </Suspense>
  );
}
