'use client';

/**
 * Audio Message Component
 * 
 * Custom audio player for voice messages with waveform visualization.
 * Displays inline within the message bubble without extra rounded container.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioMessageProps {
  src: string;
  isSent: boolean;
  duration?: number;
}

export default function AudioMessage({ src, isSent, duration: providedDuration }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(providedDuration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate stable waveform heights on mount
  const waveformHeights = useMemo(() => {
    return Array.from({ length: 40 }, () => 20 + Math.random() * 60);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-w-[220px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Player Controls - No outer container, just the controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/50"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-white" />
          ) : (
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Progress Section */}
        <div className="flex-1">
          {/* Waveform/Progress Bar */}
          <div
            onClick={handleSeek}
            className={`relative h-10 rounded-lg overflow-hidden cursor-pointer group mb-1 ${
              isSent ? 'bg-white/10' : 'bg-slate-700/50'
            }`}
          >
            {/* Progress Fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-100 bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${progress}%` }}
            />
            
            {/* Waveform Effect */}
            <div className="absolute inset-0 flex items-center justify-around px-1">
              {waveformHeights.map((height, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${
                    (i / 40) * 100 < progress
                      ? 'bg-white/90'
                      : isSent ? 'bg-white/30' : 'bg-slate-500/60'
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            
            {/* Hover Indicator */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
          </div>

          {/* Time Display */}
          <div className={`flex justify-between text-xs px-1 ${
            isSent ? 'text-white/70' : 'text-slate-400'
          }`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
            isSent ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-700/50 hover:bg-slate-600/50'
          }`}
        >
          {isMuted ? (
            <VolumeX className={`w-4 h-4 ${isSent ? 'text-white/70' : 'text-slate-300'}`} />
          ) : (
            <Volume2 className={`w-4 h-4 ${isSent ? 'text-white/70' : 'text-slate-300'}`} />
          )}
        </button>
      </div>
    </div>
  );
}
