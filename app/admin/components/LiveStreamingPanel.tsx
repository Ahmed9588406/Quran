"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Radio,
  Mic,
  MicOff,
  Users,
  Play,
  Square,
  Volume2,
  VolumeX,
  Copy,
  Check,
  X,
  Settings,
  RefreshCw,
  AlertCircle,
  Headphones,
} from "lucide-react";
import { toast } from "react-toastify";

// Backend API URLs
// Janus server - use local IP for development, or set NEXT_PUBLIC_JANUS_SERVER env var
const JANUS_SERVER = process.env.NEXT_PUBLIC_JANUS_SERVER || "http://192.168.1.29:8088/janus";
// Local proxy to avoid CORS issues
const PROXY_BASE = "/api/stream";

// Types
interface StreamRoom {
  id: number;
  roomId: number;
  title: string;
  status: "active" | "ended" | "scheduled";
  listeners: number;
  mosqueName?: string;
  preacherName?: string;
  totalViews?: number;
}

interface JanusHandle {
  getId: () => number;
  send: (params: { message: object; jsep?: RTCSessionDescriptionInit }) => void;
  createOffer: (params: {
    media: { audio: boolean; video: boolean };
    stream?: MediaStream;
    success: (jsep: RTCSessionDescriptionInit) => void;
    error: (err: Error) => void;
  }) => void;
  createAnswer: (params: {
    jsep: RTCSessionDescriptionInit;
    media: { audioSend: boolean; videoSend: boolean; audioRecv: boolean; videoRecv: boolean };
    success: (jsep: RTCSessionDescriptionInit) => void;
    error: (err: Error) => void;
  }) => void;
  handleRemoteJsep: (params: { jsep: RTCSessionDescriptionInit }) => void;
  hangup: () => void;
  onmessage?: (msg: any, jsep?: RTCSessionDescriptionInit) => void;
  onremotestream?: (stream: MediaStream) => void;
  onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
  oncleanup?: () => void;
}

interface JanusAttachParams {
  plugin: string;
  success: (handle: JanusHandle) => void;
  error: (err: Error) => void;
  onmessage?: (msg: any, jsep?: RTCSessionDescriptionInit) => void;
  onremotestream?: (stream: MediaStream) => void;
  onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
  oncleanup?: () => void;
}

interface JanusInstance {
  attach: (params: JanusAttachParams) => void;
  destroy: () => void;
}

// Use any for window.Janus to avoid type conflicts with dynamically loaded library
/* eslint-disable @typescript-eslint/no-explicit-any */
const getJanus = (): any => (window as any).Janus;

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: "bg-green-100 text-green-700 border-green-200",
    ended: "bg-gray-100 text-gray-600 border-gray-200",
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    connecting: "bg-yellow-100 text-yellow-700 border-yellow-200",
    live: "bg-red-100 text-red-700 border-red-200",
    idle: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.idle}`}>
      {status === "active" || status === "live" ? "🔴 Live" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Broadcaster Modal Component
function BroadcasterModal({
  open,
  onClose,
  room,
}: {
  open: boolean;
  onClose: () => void;
  room: StreamRoom | null;
}) {
  const [status, setStatus] = useState<"idle" | "connecting" | "live">("idle");
  const [listenerCount, setListenerCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
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
    setStatus("idle");
    setDuration(0);
    setListenerCount(0);
  }, []);

  useEffect(() => {
    if (!open) {
      cleanup();
    }
    return cleanup;
  }, [open, cleanup]);

  const startBroadcast = async () => {
    if (!room) return;

    try {
      setStatus("connecting");
      
      // Request microphone access
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      toast.success("Microphone ready!");

      // Load adapter.js first (required by Janus)
      if (!(window as any).adapter) {
        const adapterScript = document.createElement("script");
        adapterScript.src = "https://webrtc.github.io/adapter/adapter-latest.js";
        adapterScript.async = true;
        await new Promise((resolve, reject) => {
          adapterScript.onload = resolve;
          adapterScript.onerror = reject;
          document.head.appendChild(adapterScript);
        });
      }

      // Load Janus if not loaded
      const Janus = getJanus();
      if (!Janus) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js";
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Initialize Janus
      const JanusLib = getJanus();
      JanusLib.init({
        debug: "all",
        callback: () => {
          janusRef.current = new JanusLib({
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
      console.error("Microphone error:", err);
      toast.error("Microphone permission denied");
      setStatus("idle");
    }
  };

  const attachPlugin = () => {
    if (!janusRef.current || !room) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (handle: JanusHandle) => {
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
          // Create and send offer
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
    if (!pluginHandleRef.current || !room) return;
    
    pluginHandleRef.current.send({
      message: {
        request: "join",
        room: room.roomId,
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
    if (!room) return;
    
    listenerIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${PROXY_BASE}/${room.id}/listeners`);
        const data = await response.json();
        setListenerCount(data.listeners || 0);
      } catch (error) {
        console.error("Error polling listeners:", error);
      }
    }, 3000);
  };

  const endBroadcast = async () => {
    if (!room) return;
    
    if (!confirm("Are you sure you want to end this stream?")) return;

    try {
      const response = await fetch(`${PROXY_BASE}/${room.id}/end`, { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        toast.success("Stream ended successfully!");
        cleanup();
        onClose();
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

  if (!open || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Broadcasting</h3>
                <p className="text-sm text-white/80">{room.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              status === "live" ? "bg-red-500 animate-pulse" :
              status === "connecting" ? "bg-yellow-500 animate-pulse" :
              "bg-gray-400"
            }`} />
            <span className="text-lg font-medium text-[#231217]">
              {status === "live" ? "🔴 LIVE - Broadcasting" :
               status === "connecting" ? "Connecting..." :
               "Ready to broadcast"}
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
              <Radio className="w-6 h-6 mx-auto mb-2 text-[#8A1538]" />
              <p className="text-2xl font-bold text-[#8A1538]">{formatDuration(duration)}</p>
              <p className="text-sm text-gray-500">Duration</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {status === "idle" ? (
              <button
                onClick={startBroadcast}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
              >
                <Mic className="w-5 h-5" />
                Start Broadcasting
              </button>
            ) : status === "live" ? (
              <>
                <button
                  onClick={toggleMute}
                  className={`h-12 px-6 rounded-xl font-medium transition-colors ${
                    isMuted
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={endBroadcast}
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  <Square className="w-5 h-5" />
                  End Stream
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center h-12 rounded-xl bg-yellow-100 text-yellow-700">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// Listener Modal Component
function ListenerModal({
  open,
  onClose,
  room,
}: {
  open: boolean;
  onClose: () => void;
  room: StreamRoom | null;
}) {
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [listenerCount, setListenerCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const janusRef = useRef<JanusInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userIdRef = useRef(Math.floor(Math.random() * 1000000));
  const streamCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);

  const cleanup = useCallback(() => {
    isCleaningUpRef.current = true;
    if (streamCheckIntervalRef.current) clearInterval(streamCheckIntervalRef.current);
    
    // Stop audio playback before destroying to avoid AbortError
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    
    if (janusRef.current) janusRef.current.destroy();
    janusRef.current = null;
    notifyLeave();
    setStatus("idle");
    setListenerCount(0);
  }, []);

  useEffect(() => {
    if (open && room) {
      isCleaningUpRef.current = false;
      initialize();
    }
    return cleanup;
  }, [open, room]);

  const notifyJoin = async () => {
    if (!room) return;
    try {
      await fetch(`${PROXY_BASE}/${room.id}/join?userId=${userIdRef.current}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify join:", err);
    }
  };

  const notifyLeave = async () => {
    if (!room) return;
    try {
      await fetch(`${PROXY_BASE}/${room.id}/leave?userId=${userIdRef.current}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify leave:", err);
    }
  };

  const checkStreamStatus = async () => {
    if (!room) return true;
    try {
      const response = await fetch(`${PROXY_BASE}/${room.id}/info`);
      const data = await response.json();
      
      if (data.status === "ENDED") {
        setStatus("ended");
        return false;
      }
      
      setListenerCount(data.listenerCount || 0);
      return true;
    } catch (error) {
      console.error("Error checking stream status:", error);
      return true;
    }
  };

  const initialize = async () => {
    if (!room) return;

    setStatus("connecting");
    
    const isActive = await checkStreamStatus();
    if (!isActive) return;

    notifyJoin();
    startJanus();
    
    streamCheckIntervalRef.current = setInterval(async () => {
      const isActive = await checkStreamStatus();
      if (!isActive && streamCheckIntervalRef.current) {
        clearInterval(streamCheckIntervalRef.current);
      }
    }, 5000);
  };

  const startJanus = async () => {
    // Load adapter.js first (required by Janus)
    if (!(window as any).adapter) {
      const adapterScript = document.createElement("script");
      adapterScript.src = "https://webrtc.github.io/adapter/adapter-latest.js";
      adapterScript.async = true;
      await new Promise((resolve, reject) => {
        adapterScript.onload = resolve;
        adapterScript.onerror = reject;
        document.head.appendChild(adapterScript);
      });
    }

    const Janus = getJanus();
    if (!Janus) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/meetecho/janus-gateway/html/janus.js";
      script.async = true;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    initJanus();
  };

  const initJanus = () => {
    if (!room) return;

    const JanusLib = getJanus();
    JanusLib.init({
      debug: "all",
      callback: () => {
        janusRef.current = new JanusLib({
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
    if (!janusRef.current || !room) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (handle: JanusHandle) => {
        handle.send({
          message: {
            request: "join",
            room: room.roomId,
            ptype: "publisher",
            display: "Listener",
            audio: false,
            video: false,
          },
        });
      },
      error: (err: Error) => {
        console.error("Discovery attach error:", err);
        toast.error("Error joining room");
        setStatus("idle");
      },
      onmessage: (msg: any) => {
        let publishers: any[] = [];
        if (Array.isArray(msg.publishers)) publishers = msg.publishers;
        else if (msg.plugindata?.data?.publishers) publishers = msg.plugindata.data.publishers;

        if (publishers.length > 0) {
          const feedId = publishers[0].id;
          subscribeToFeed(feedId);
        }
      },
    });
  };

  const subscribeToFeed = (feedId: number) => {
    if (!janusRef.current || !room) return;

    janusRef.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (subHandle) => {
        subHandle.send({
          message: {
            request: "join",
            room: room.roomId,
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
          if (track && track.kind === "audio") {
            const stream = new MediaStream([track]);
            attachRemoteStream(stream);
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
      
      // Only play if not cleaning up
      if (!isCleaningUpRef.current) {
        audioRef.current.play()
          .then(() => {
            if (!isCleaningUpRef.current) {
              setStatus("live");
              toast.success("Connected to live stream!");
            }
          })
          .catch((err) => {
            // Ignore AbortError which happens during cleanup
            if (err.name === "AbortError") {
              console.log("Audio play aborted (modal closing)");
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

  if (!open || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Listening</h3>
                <p className="text-sm text-white/80">{room.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hidden audio element */}
          <audio ref={audioRef} autoPlay playsInline className="hidden" />

          {/* Status */}
          <div className="flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              status === "live" ? "bg-green-500 animate-pulse" :
              status === "connecting" ? "bg-yellow-500 animate-pulse" :
              status === "ended" ? "bg-red-500" :
              "bg-gray-400"
            }`} />
            <span className="text-lg font-medium text-[#231217]">
              {status === "live" ? "🎶 Playing live audio" :
               status === "connecting" ? "Connecting..." :
               status === "ended" ? "Stream Ended" :
               "Ready to listen"}
            </span>
          </div>

          {status === "ended" ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Stream Ended</h3>
              <p className="text-gray-500">This live stream has ended.</p>
              {room.totalViews && (
                <p className="text-sm text-gray-400 mt-2">Total Views: {room.totalViews}</p>
              )}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bg-[#FFF9F3] rounded-xl p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-[#8A1538]" />
                <p className="text-2xl font-bold text-[#8A1538]">{listenerCount}</p>
                <p className="text-sm text-gray-500">Current Listeners</p>
              </div>

              {/* Volume Control */}
              <div className="flex justify-center">
                <button
                  onClick={toggleMute}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    isMuted
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-5 h-5" />
                      Unmute Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      Audio Playing
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// Room Card Component
function RoomCard({
  room,
  onBroadcast,
  onListen,
  onCopyLink,
  onDelete,
  onEndStream,
}: {
  room: StreamRoom;
  onBroadcast: (room: StreamRoom) => void;
  onListen: (room: StreamRoom) => void;
  onCopyLink: (type: "broadcaster" | "listener", room: StreamRoom) => void;
  onDelete: (id: number) => void;
  onEndStream: (id: number) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            room.status === "active" ? "bg-green-100" : "bg-[#FFF9F3]"
          }`}>
            <Radio className={`w-6 h-6 ${room.status === "active" ? "text-green-600" : "text-[#8A1538]"}`} />
          </div>
          <div>
            <h3 className="font-medium text-[#231217]">{room.title}</h3>
            <p className="text-sm text-gray-500">Room #{room.roomId}</p>
          </div>
        </div>
        <StatusBadge status={room.status} />
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{room.listeners} listeners</span>
        </div>
        {room.mosqueName && (
          <span className="text-gray-400">• {room.mosqueName}</span>
        )}
      </div>

      <div className="flex gap-2">
        {room.status === "active" ? (
          <>
            <button
              onClick={() => onListen(room)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              <Headphones className="w-4 h-4" />
              Listen
            </button>
            <button
              onClick={() => onBroadcast(room)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
            >
              <Mic className="w-4 h-4" />
              Broadcast
            </button>
          </>
        ) : (
          <button
            onClick={() => onBroadcast(room)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Stream
          </button>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button
                  onClick={() => {
                    onCopyLink("broadcaster", room);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  Copy Broadcaster Link
                </button>
                <button
                  onClick={() => {
                    onCopyLink("listener", room);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  Copy Listener Link
                </button>
                {room.status === "active" && (
                  <button
                    onClick={() => {
                      onEndStream(room.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    <Square className="w-4 h-4" />
                    End Stream
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(room.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  Delete Room
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Room Modal
function CreateRoomModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mosqueId, setMosqueId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mosqueId.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${PROXY_BASE}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          mosqueId: parseInt(mosqueId),
        }),
      });

      if (response.ok) {
        toast.success("Room created successfully!");
        onCreated();
        onClose();
        setTitle("");
        setDescription("");
        setMosqueId("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create room");
      }
    } catch (error) {
      toast.error("Error creating room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[480px] max-w-[92vw] bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-[#231217]">Create New Room</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Friday Khutbah"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mosque ID *
            </label>
            <input
              type="number"
              value={mosqueId}
              onChange={(e) => setMosqueId(e.target.value)}
              placeholder="Enter mosque ID"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Main Live Streaming Panel Component
export default function LiveStreamingPanel() {
  const [rooms, setRooms] = useState<StreamRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBroadcasterOpen, setIsBroadcasterOpen] = useState(false);
  const [isListenerOpen, setIsListenerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<StreamRoom | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      // Use local proxy to avoid CORS issues
      const response = await fetch(`${PROXY_BASE}/rooms?size=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      const mappedRooms: StreamRoom[] = (data.content || []).map((room: any) => ({
        id: room.id,
        roomId: room.roomId || room.id,
        title: room.title || `Room #${room.id}`,
        status: room.status?.toLowerCase() === "active" ? "active" : "ended",
        listeners: room.listenerCount || 0,
        mosqueName: room.mosque?.name,
        preacherName: room.creator?.displayName,
        totalViews: room.totalViews,
      }));
      
      setRooms(mappedRooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = (room: StreamRoom) => {
    setSelectedRoom(room);
    setIsBroadcasterOpen(true);
  };

  const handleListen = (room: StreamRoom) => {
    setSelectedRoom(room);
    setIsListenerOpen(true);
  };

  const handleCopyLink = (type: "broadcaster" | "listener", room: StreamRoom) => {
    const baseUrl = window.location.origin;
    const url = type === "broadcaster"
      ? `${baseUrl}/admin/broadcast?roomId=${room.roomId}&liveStreamId=${room.id}`
      : `${baseUrl}/admin/listen?roomId=${room.roomId}&liveStreamId=${room.id}`;
    
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    toast.success(`${type === "broadcaster" ? "Broadcaster" : "Listener"} link copied!`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${PROXY_BASE}/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        toast.success("Room deleted successfully");
        fetchRooms();
      } else {
        toast.error("Failed to delete room");
      }
    } catch (error) {
      toast.error("Error deleting room");
    }
  };

  const handleEndStream = async (id: number) => {
    if (!confirm("Are you sure you want to end this stream?")) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${PROXY_BASE}/${id}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        toast.success("Stream ended successfully");
        fetchRooms();
      } else {
        toast.error("Failed to end stream");
      }
    } catch (error) {
      toast.error("Error ending stream");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = !searchQuery ||
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.mosqueName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = rooms.filter(r => r.status === "active").length;
  const totalListeners = rooms.reduce((sum, r) => sum + r.listeners, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#8A1538]">Live Streaming</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage live audio broadcasts with WebRTC
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
        >
          <Radio className="w-5 h-5" />
          Create Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF9F3] flex items-center justify-center">
              <Radio className="w-6 h-6 text-[#8A1538]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#231217]">{rooms.length}</p>
              <p className="text-sm text-gray-500">Total Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Radio className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-green-700">{activeCount}</p>
              <p className="text-sm text-green-600">Active Streams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF9F3] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#8A1538]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#231217]">{totalListeners}</p>
              <p className="text-sm text-gray-500">Total Listeners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="w-full h-11 pl-4 pr-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "ended"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#8A1538] text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={fetchRooms}
          className="h-11 px-4 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Rooms Grid */}
      {isLoading && rooms.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBroadcast={handleBroadcast}
              onListen={handleListen}
              onCopyLink={handleCopyLink}
              onDelete={handleDelete}
              onEndStream={handleEndStream}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Radio className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No rooms found</h3>
          <p className="text-gray-500 mb-4">Create a new room to start streaming</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029]"
          >
            <Radio className="w-4 h-4" />
            Create Room
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchRooms}
      />

      <BroadcasterModal
        open={isBroadcasterOpen}
        onClose={() => {
          setIsBroadcasterOpen(false);
          setSelectedRoom(null);
          fetchRooms();
        }}
        room={selectedRoom}
      />

      <ListenerModal
        open={isListenerOpen}
        onClose={() => {
          setIsListenerOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />
    </div>
  );
}
