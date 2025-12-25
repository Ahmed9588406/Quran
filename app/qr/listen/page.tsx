"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Image from "next/image";
import { Radio, Volume2, VolumeX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import NavBar from "../../user/navbar";
import LeftSide from "../../user/leftside";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Script from "next/script";

const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
const BACKEND_BASE = "/api/admin/stream";

declare const Janus: any;

interface StreamInfo {
  mosqueName: string;
  preacherName: string;
  topic: string;
  status: "ACTIVE" | "ENDED" | "PENDING";
  listenerCount: number;
  startedAt?: string;
}

function ListenPageContent() {
  const searchParams = useSearchParams();
  const roomId = parseInt(searchParams.get("roomId") || "0");
  const liveStreamId = parseInt(searchParams.get("liveStreamId") || "0") || roomId;

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const MessagesModal = dynamic(() => import("../../user/messages"), { ssr: false });

  // Stream state
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [statusText, setStatusText] = useState("Waiting to connect...");
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [listenerCount, setListenerCount] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [janusLoaded, setJanusLoaded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Refs
  const userIdRef = useRef(Math.floor(Math.random() * 1000000));
  const janusRef = useRef<any>(null);
  const discoveryHandleRef = useRef<any>(null);
  const subscribedRef = useRef(false);
  const streamCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const waveformBarsRef = useRef<HTMLDivElement[]>([]);

  // Waveform bars
  const waveformBars = Array.from({ length: 60 }, (_, i) => i);

  const animateWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    
    waveformBarsRef.current.forEach((bar, i) => {
      if (!bar) return;
      
      let height = 10;
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const dataIndex = Math.floor((i / 60) * bufferLength * 0.5);
        let value = dataArray[dataIndex] || 0;
        if (value < 10) value = Math.random() * 15;
        height = Math.max(10, (value / 255) * 100);
      } else {
        // Idle animation
        height = 10 + Math.random() * 8;
      }
      bar.style.height = `${height}px`;
    });

    animationRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (err) {
      console.error("Failed to setup audio analyser:", err);
    }
  }, []);

  const notifyJoin = useCallback(async () => {
    if (!liveStreamId) return;
    try {
      await fetch(`${BACKEND_BASE}/${liveStreamId}?action=join&userId=${userIdRef.current}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify join:", err);
    }
  }, [liveStreamId]);

  const notifyLeave = useCallback(async () => {
    if (!liveStreamId) return;
    try {
      await fetch(`${BACKEND_BASE}/${liveStreamId}?action=leave&userId=${userIdRef.current}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify leave:", err);
    }
  }, [liveStreamId]);

  const handleStreamEnded = useCallback(() => {
    setStatus("ended");
    setStatusText("Stream Ended");
    setShowPlayButton(false);
    if (streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
    if (janusRef.current) {
      try { janusRef.current.destroy(); } catch {}
    }
    notifyLeave();
  }, [notifyLeave]);

  const checkStreamStatus = useCallback(async (): Promise<boolean> => {
    if (!liveStreamId) return false;
    try {
      const response = await fetch(`${BACKEND_BASE}/${liveStreamId}?action=info`);
      if (!response.ok) return true;
      const data = await response.json();

      setStreamInfo({
        mosqueName: data.mosqueName || data.mosque?.name || "Mosque",
        preacherName: data.preacherName || data.creator?.displayName || "Preacher",
        topic: data.topic || data.title || "Khotba",
        status: data.status,
        listenerCount: data.listenerCount || 0,
        startedAt: data.startedAt,
      });

      if (data.status === "ENDED") {
        handleStreamEnded();
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
    setupAudioAnalyser(stream);

    audioEl.play().then(() => {
      audioEl.muted = false;
      audioEl.volume = volume;
      setStatus("live");
      setStatusText("Playing live audio");
    }).catch(() => {
      setStatus("live");
      setStatusText("Ready to play - tap button");
      setShowPlayButton(true);
    });
  }, [volume, setupAudioAnalyser]);

  const subscribeToFeed = useCallback((feedId: number) => {
    if (subscribedRef.current || !janusRef.current) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: function (subHandle: any) {
        subHandle.send({
          message: {
            request: "join",
            room: roomId,
            ptype: "subscriber",
            feed: feedId,
            offer_audio: true,
            offer_video: false
          }
        });

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
      }
    });
  }, [roomId, attachRemoteStreamToAudio]);

  const attachDiscoveryHandle = useCallback(() => {
    if (!janusRef.current) return;
    setStatusText("Joining room...");

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: function (handle: any) {
        discoveryHandleRef.current = handle;
        handle.send({
          message: {
            request: "join",
            room: roomId,
            ptype: "publisher",
            display: "Listener",
            audio: false,
            video: false
          }
        });
        setStatusText("Waiting for broadcaster...");
      },
      error: function () {
        setStatus("idle");
        setStatusText("Failed to join room");
      },
      onmessage: function (msg: any) {
        const publishers = msg.publishers || msg.plugindata?.data?.publishers || msg.participants?.filter((p: any) => p.publisher) || [];
        if (publishers.length > 0) {
          setStatusText("Connecting to stream...");
          subscribeToFeed(publishers[0].id);
        }
      }
    });
  }, [roomId, subscribeToFeed]);

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
            setStatusText("Connection error: " + err);
          }
        });
      }
    });
  }, [attachDiscoveryHandle]);

  const initialize = useCallback(async () => {
    if (!roomId || !liveStreamId) {
      setStatusText("Missing room ID - scan a QR code first");
      return;
    }

    setStatus("connecting");
    setStatusText("Checking stream status...");

    const isActive = await checkStreamStatus();
    if (!isActive) return;

    notifyJoin();
    startJanus();

    streamCheckIntervalRef.current = setInterval(async () => {
      const active = await checkStreamStatus();
      if (!active && streamCheckIntervalRef.current) {
        clearInterval(streamCheckIntervalRef.current);
      }
    }, 5000);
  }, [roomId, liveStreamId, checkStreamStatus, notifyJoin, startJanus]);

  // Initialize when Janus is loaded
  useEffect(() => {
    if (janusLoaded && roomId) {
      initialize();
    }
  }, [janusLoaded, roomId, initialize]);

  // Start waveform animation
  useEffect(() => {
    animateWaveform();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animateWaveform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notifyLeave();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
      if (janusRef.current) {
        try { janusRef.current.destroy(); } catch {}
      }
    };
  }, [notifyLeave]);

  // Handle page unload
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
      setShowPlayButton(false);
    }).catch((err) => console.error("Failed to play:", err));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const getTimeSinceStart = () => {
    if (!streamInfo?.startedAt) return "Just started";
    const start = new Date(streamInfo.startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just started";
    if (diffMins === 1) return "1 minute ago";
    return `${diffMins} minutes ago`;
  };

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="https://webrtc.github.io/adapter/adapter-latest.js" strategy="beforeInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js"
        strategy="afterInteractive"
        onLoad={() => setJanusLoaded(true)}
        onError={() => setStatusText("Failed to load streaming library")}
      />

      <NavBar
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        isSidebarOpen={isSidebarOpen}
      />

      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenScan={() => {}}
        activeView="listen"
      />

      <div
        className="min-h-screen flex justify-center items-center p-5 font-sans"
        style={{
          backgroundImage: "url('/icons/settings/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="w-full max-w-[760px] rounded-lg shadow-xl flex flex-col relative bg-white/30 backdrop-blur-md">
          <div className="bg-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🕌</span>
                <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                  {streamInfo?.mosqueName || "Mosque"}
                </h1>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                status === "live" 
                  ? "bg-red-100 text-red-600 animate-pulse" 
                  : status === "ended"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-amber-100 text-amber-600"
              }`}>
                <Radio size={16} />
                <span>{status === "live" ? "LIVE" : status === "ended" ? "ENDED" : "CONNECTING"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">Khateb:</span>
                <span className="text-amber-700 ml-1">{streamInfo?.preacherName || "Loading..."}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">Topic:</span>
                <span className="text-amber-700 ml-1">{streamInfo?.topic || "Khotba"}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">Started:</span>
                <span className="text-amber-700 ml-1">{getTimeSinceStart()}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">Listeners:</span>
                <span className="text-amber-700 ml-1">{listenerCount}</span>
              </div>
            </div>

            {/* Status message */}
            <div className="mt-3 text-center text-sm text-gray-500">
              {statusText}
            </div>

            {/* Play button when needed */}
            {showPlayButton && (
              <button
                onClick={manualPlay}
                className="mt-3 w-full py-2 bg-[#7a1233] text-white rounded-lg font-medium hover:bg-[#8a2243] transition-colors"
              >
                ▶️ Tap to Play Audio
              </button>
            )}

            {/* Volume control */}
            {status === "live" && (
              <div className="mt-3 flex items-center gap-3">
                <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  {isMuted ? <VolumeX size={20} className="text-red-500" /> : <Volume2 size={20} className="text-green-600" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-10">{Math.round(volume * 100)}%</span>
              </div>
            )}
          </div>

          <div
            className="relative h-60 shrink-0 rounded-b-lg"
            style={{
              background:
                "linear-gradient(124.85deg, #8A1538 -5.48%, #CFAE70 20.73%, #808080 71.48%, #8A1538 101.6%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-[80%] h-40 flex items-center justify-center gap-0.5">
                {waveformBars.map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) waveformBarsRef.current[i] = el;
                    }}
                    className="wave-bar"
                    style={{ height: "10px" }}
                  >
                    <div className="bar-part top" />
                    <div className="bar-part bottom" />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-5 -right-1 w-80 h-90 z-20">
              <Image
                src="/icons/qr/emam2.svg"
                alt="Imam"
                className="w-full h-full object-cover"
                width={320}
                height={320}
                draggable={false}
              />
            </div>

            <style jsx>{`
              .wave-bar {
                width: 4px;
                min-width: 2px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: height 0.1s ease;
              }
              .wave-bar .bar-part {
                width: 100%;
                height: 50%;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 2px;
              }
              .wave-bar .bar-part.top {
                margin-bottom: 1px;
              }
              .wave-bar .bar-part.bottom {
                margin-top: 1px;
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />

      {/* Floating messages button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Quick action"
          className="w-[143px] h-[56px] bg-[#7a1233] text-white rounded-[16px] inline-flex items-center justify-center gap-2 px-4 py-2 shadow-lg hover:bg-[#5e0e27]"
          type="button"
          onClick={() => setMessagesOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>

      {isMessagesOpen && (
        <MessagesModal
          isOpen={true}
          onClose={() => setMessagesOpen(false)}
          onOpenStart={() => setMessagesOpen(false)}
        />
      )}
    </>
  );
}

export default function ListenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ListenPageContent />
    </Suspense>
  );
}
