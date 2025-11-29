"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { Radio } from "lucide-react";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

function ListenPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // NEW: messages modal state
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const waveformBarsRef = useRef<HTMLDivElement[]>([]);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.8);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const waveformBars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i);
  }, []);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      audioContextRef.current = new AudioContextClass();

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.85;

      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = volumeRef.current;

      analyserRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  const playTone = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current || !isPlayingRef.current) return;

    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
    }

    const osc = audioContextRef.current.createOscillator();
    const noteGain = audioContextRef.current.createGain();

    const frequencies = [185, 207, 220, 233, 247, 262, 277, 294, 311, 330];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);

    const now = audioContextRef.current.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(noteGain);
    noteGain.connect(analyserRef.current);

    osc.start(now);
    osc.stop(now + 0.8);
    oscillatorRef.current = osc;

    setTimeout(() => {
      // eslint-disable-next-line react-hooks/immutability
      if (isPlayingRef.current) playTone();
    }, 400 + Math.random() * 200);
  }, []);

  const animateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    waveformBarsRef.current.forEach((bar, i) => {
      if (!bar) return;
      
      const dataIndex = Math.floor((i / 60) * bufferLength * 0.5);
      let value = dataArray[dataIndex] || 0;

      if (value < 10 && isPlayingRef.current) value = Math.random() * 10;

      const height = Math.max(10, (value / 255) * 100);
      bar.style.height = `${height}px`;
    });

    if (isPlayingRef.current) {
      // eslint-disable-next-line react-hooks/immutability
      animationRef.current = requestAnimationFrame(animateWaveform);
    }
  }, []);

  // Removed unused playback control helpers to avoid unused-variable build errors.
  // Keep core audio functions (initAudio, playTone, animateWaveform) which are used.

  useEffect(() => {
    const start = async () => {
      try {
        initAudio();
        await audioContextRef.current?.resume();
        setIsPlaying(true);
        isPlayingRef.current = true;
        playTone();
        animateWaveform();
      } catch {
        console.log("Autoplay blocked");
      }
    };

    const timer = setTimeout(start, 1000);

    return () => {
      clearTimeout(timer);
      isPlayingRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContextRef.current?.close();
    };
  }, [initAudio, playTone, animateWaveform]);

  return (
    <>
      {/* Top navigation (appears at top of this page) */}
      <NavBar
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Left side panel (sidebar) */}
      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenScan={() => {
          /* optional: handle scan action if needed */
        }}
        activeView="listen"
      />

      {/* existing page content */}
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
                  Msheireb Mosque
                </h1>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold animate-pulse">
                <Radio size={16} />
                <span>LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">Khateb:</span>
                <span className="text-amber-700 ml-1">Mabrouk</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">Date:</span>
                <span className="text-amber-700 ml-1">7/23/2025 Hejry</span>
              </div>
              <div className="text-gray-600 col-span-2">
                <span className="font-semibold text-gray-800">Started:</span>
                <span className="text-amber-700 ml-1">22 Minutes ago</span>
              </div>
            </div>
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

      {/* Floating messages button (bottom-right) */}
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

      {/* Messages modal (dynamically loaded) */}
      {isMessagesOpen && (
        <MessagesModal
          isOpen={true}
          onClose={() => setMessagesOpen(false)}
          onOpenStart={() => {
            /* optional: open composer; not implemented here */
            setMessagesOpen(false);
          }}
        />
      )}
    </>
  );
}

export default ListenPage;
