"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Headphones, Users, Volume2, VolumeX, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Backend API URLs
// Janus server - use local IP for development, or set NEXT_PUBLIC_JANUS_SERVER env var
const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
const PROXY_BASE = "/api/stream"; // Use local proxy to avoid CORS

interface JanusHandle {
  getId: () => number;
  send: (params: { message: object; jsep?: RTCSessionDescriptionInit }) => void;
  createAnswer: (params: {
    jsep: RTCSessionDescriptionInit;
    media: { audioSend: boolean; videoSend: boolean; audioRecv: boolean; videoRecv: boolean };
    success: (jsep: RTCSessionDescriptionInit) => void;
    error: (err: Error) => void;
  }) => void;
  onmessage?: (msg: any, jsep?: RTCSessionDescriptionInit) => void;
  onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
}

interface JanusInstance {
  attach: (params: {
    plugin: string;
    success: (handle: JanusHandle) => void;
    error: (err: Error) => void;
    onmessage?: (msg: any, jsep?: RTCSessionDescriptionInit) => void;
    onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
  }) => void;
  destroy: () => void;
}

// Use any for window.Janus to avoid type conflicts with dynamically loaded library
/* eslint-disable @typescript-eslint/no-explicit-any */
const getJanus = (): any => (window as any).Janus;

export default function ListenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = parseInt(searchParams.get("roomId") || "0");
  const liveStreamId = parseInt(searchParams.get("liveStreamId") || "0");

  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [listenerCount, setListenerCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [roomTitle, setRoomTitle] = useState("");
  const [totalViews, setTotalViews] = useState(0);

  const janusRef = useRef<JanusInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userIdRef = useRef(Math.floor(Math.random() * 1000000));
  const streamCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedRef = useRef(false);
  const isCleaningUpRef = useRef(false);

  const cleanup = useCallback(() => {
    isCleaningUpRef.current = true;
    if (streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
    
    // Stop audio playback before destroying
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    
    if (janusRef.current) janusRef.current.destroy();
    janusRef.current = null;
    subscribedRef.current = false;
  }, []);

  const notifyJoin = async () => {
    try {
      await fetch(`${PROXY_BASE}/${liveStreamId}/join?userId=${userIdRef.current}`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to notify join:", err);
    }
  };

  const notifyLeave = async () => {
    try {
      await fetch(`${PROXY_BASE}/${liveStreamId}/leave?userId=${userIdRef.current}`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to notify leave:", err);
    }
  };

  const checkStreamStatus = async () => {
    try {
      const response = await fetch(`${PROXY_BASE}/${liveStreamId}/info`);
      const data = await response.json();

      setRoomTitle(data.title || `Room #${roomId}`);

      if (data.status === "ENDED") {
        setStatus("ended");
        setTotalViews(data.totalViews || 0);
        return false;
      }

      setListenerCount(data.listenerCount || 0);
      return true;
    } catch (error) {
      console.error("Error checking stream status:", error);
      return true;
    }
  };

  const loadJanusScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (getJanus()) {
        resolve();
        return;
      }

      const adapterScript = document.createElement("script");
      adapterScript.src = "https://webrtc.github.io/adapter/adapter-latest.js";
      adapterScript.async = true;
      adapterScript.onload = () => {
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

  const initialize = async () => {
    if (!roomId || !liveStreamId) return;

    setStatus("connecting");

    const isActive = await checkStreamStatus();
    if (!isActive) return;

    notifyJoin();

    try {
      await loadJanusScript();
      startJanus();
    } catch (error) {
      console.error("Failed to load Janus:", error);
      toast.error("Failed to load streaming library");
      setStatus("idle");
    }

    streamCheckIntervalRef.current = setInterval(async () => {
      const isActive = await checkStreamStatus();
      if (!isActive && streamCheckIntervalRef.current) {
        clearInterval(streamCheckIntervalRef.current);
      }
    }, 5000);
  };

  const startJanus = () => {
    const Janus = getJanus();
    Janus.init({
      debug: "all",
      callback: () => {
        janusRef.current = new Janus({
          server: JANUS_SERVER,
          success: () => attachDiscoveryHandle(),
          error: (err: Error) => {
            console.error("Janus error:", err);
            toast.error("Failed to connect to stream server");
            setStatus("idle");
          },
        });
      },
    });
  };

  const attachDiscoveryHandle = () => {
    if (!janusRef.current) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (handle) => {
        handle.send({
          message: {
            request: "join",
            room: roomId,
            ptype: "publisher",
            display: "Listener",
            audio: false,
            video: false,
          },
        });
      },
      error: (err) => {
        console.error("Discovery attach error:", err);
        toast.error("Error joining room");
        setStatus("idle");
      },
      onmessage: (msg) => {
        let publishers: any[] = [];
        if (Array.isArray(msg.publishers)) publishers = msg.publishers;
        else if (msg.plugindata?.data?.publishers) publishers = msg.plugindata.data.publishers;
        else if (Array.isArray(msg.participants))
          publishers = msg.participants.filter((p: any) => p.publisher);

        if (publishers.length > 0 && !subscribedRef.current) {
          const feedId = publishers[0].id;
          subscribeToFeed(feedId);
        }
      },
    });
  };

  const subscribeToFeed = (feedId: number) => {
    if (!janusRef.current || subscribedRef.current) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (subHandle) => {
        subHandle.send({
          message: {
            request: "join",
            room: roomId,
            ptype: "subscriber",
            feed: feedId,
            offer_audio: true,
            offer_video: false,
          },
        });

        subHandle.onmessage = (msg, jsep) => {
          if (jsep) {
            subHandle.createAnswer({
              jsep,
              media: { audioSend: false, videoSend: false, audioRecv: true, videoRecv: false },
              success: (jsepAnswer) => {
                subHandle.send({ message: { request: "start" }, jsep: jsepAnswer });
              },
              error: (err) => {
                console.error("createAnswer error:", err);
                toast.error("Failed to receive stream");
                setStatus("idle");
              },
            });
          }
        };

        subHandle.onremotetrack = (track, mid, on) => {
          if (track && track.kind === "audio" && on) {
            const stream = new MediaStream([track]);
            attachRemoteStream(stream);
            subscribedRef.current = true;
          }
        };
      },
      error: (err) => {
        console.error("Subscriber attach error:", err);
        toast.error("Error subscribing to stream");
        setStatus("idle");
      },
    });
  };

  const attachRemoteStream = (stream: MediaStream) => {
    // Don't attach if we're cleaning up
    if (isCleaningUpRef.current) return;
    
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.muted = true;
      setIsMuted(true);
      
      // Only play if not cleaning up
      if (!isCleaningUpRef.current) {
        audioRef.current
          .play()
          .then(() => {
            if (!isCleaningUpRef.current) {
              setStatus("live");
              toast.success("Connected to live stream!");
            }
          })
          .catch((err) => {
            // Ignore AbortError which happens during cleanup
            if (err.name === "AbortError") {
              console.log("Audio play aborted (component unmounting)");
              return;
            }
            console.warn("Autoplay prevented:", err);
            if (!isCleaningUpRef.current) {
              setStatus("live");
              toast.info("Click unmute to hear the stream");
            }
          });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
      if (!audioRef.current.muted) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  useEffect(() => {
    isCleaningUpRef.current = false;
    
    if (roomId && liveStreamId) {
      initialize();
    }

    return () => {
      cleanup();
      notifyLeave();
    };
  }, [roomId, liveStreamId]);

  if (!roomId || !liveStreamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8A1538] to-[#6d1029] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
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
        {/* Hidden audio element */}
        <audio ref={audioRef} autoPlay playsInline className="hidden" />

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
              <h1 className="text-xl font-semibold">🎧 Live Stream</h1>
              <p className="text-sm text-white/80">{roomTitle || `Room #${roomId}`}</p>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-center py-4">
            <div
              className={`w-4 h-4 rounded-full mr-3 ${
                status === "live"
                  ? "bg-green-500 animate-pulse"
                  : status === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : status === "ended"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-lg font-medium text-[#231217]">
              {status === "live"
                ? "🎶 Playing live audio"
                : status === "connecting"
                ? "Connecting..."
                : status === "ended"
                ? "Stream Ended"
                : "Ready to listen"}
            </span>
          </div>

          {status === "ended" ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Stream Ended</h3>
              <p className="text-gray-500">This live stream has ended.</p>
              <p className="text-sm text-gray-400 mt-2">Total Views: {totalViews}</p>
              <button
                onClick={() => router.push("/admin")}
                className="mt-6 px-6 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029]"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bg-[#FFF9F3] rounded-xl p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-[#8A1538]" />
                <p className="text-3xl font-bold text-[#8A1538]">{listenerCount}</p>
                <p className="text-sm text-gray-500">Current Listeners</p>
              </div>

              {/* Volume Control */}
              <div className="flex justify-center">
                <button
                  onClick={toggleMute}
                  disabled={status !== "live"}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-lg transition-colors ${
                    status !== "live"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isMuted
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-6 h-6" />
                      Unmute Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-6 h-6" />
                      Audio Playing
                    </>
                  )}
                </button>
              </div>

              {status === "connecting" && (
                <div className="flex items-center justify-center text-yellow-600">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Connecting to stream...
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
