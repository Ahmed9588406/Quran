/* eslint-disable react-hooks/purity */
import React from 'react';

export default function IslamicLoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-red-950 flex items-center justify-center overflow-hidden relative">
      {/* Intricate Islamic Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamicPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50,10 L60,30 L80,30 L65,42 L70,62 L50,50 L30,62 L35,42 L20,30 L40,30 Z" fill="white" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamicPattern)" />
        </svg>
      </div>

      {/* Floating Arabic Calligraphy Style Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <svg viewBox="0 0 100 100" className="text-amber-400">
              <path d="M50,10 L60,30 L80,30 L65,42 L70,62 L50,50 L30,62 L35,42 L20,30 L40,30 Z" fill="currentColor"/>
            </svg>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes mandalaRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes bismillahPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes petalBloom {
          0%, 100% { transform: scale(0.95) rotate(0deg); }
          50% { transform: scale(1) rotate(5deg); }
        }
      `}</style>

      {/* Main Sacred Geometry Loading Design */}
      <div className="relative z-10 flex flex-col items-center gap-16">
        
        {/* Bismillah-inspired Header */}
        <div className="text-center space-y-3" style={{animation: 'bismillahPulse 3s ease-in-out infinite'}}>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-amber-400"></div>
            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2 L15,8 L21,9 L16.5,13.5 L18,20 L12,16.5 L6,20 L7.5,13.5 L3,9 L9,8 Z"/>
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent via-amber-400 to-amber-400"></div>
          </div>
          
          <h1 className="text-4xl font-serif text-amber-200 tracking-widest" style={{fontFamily: 'serif'}}>
            بِسْمِ ٱللَّٰهِ
          </h1>
          
          <p className="text-amber-300/70 text-sm tracking-[0.3em] uppercase">
            In the name of Allah
          </p>
        </div>

        {/* Complex Islamic Mandala Loader */}
        <div className="relative w-72 h-72">
          {/* Outermost ornamental ring */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-amber-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-144px)`,
                  animation: `bismillahPulse ${2 + i * 0.1}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>

          {/* Rotating geometric pattern layer 1 */}
          <div className="absolute inset-8" style={{animation: 'mandalaRotate 20s linear infinite'}}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <g transform="translate(100,100)">
                {[...Array(8)].map((_, i) => (
                  <path
                    key={i}
                    d="M0,-80 Q20,-60 0,-40 Q-20,-60 0,-80"
                    fill="none"
                    stroke="rgb(251, 191, 36)"
                    strokeWidth="2"
                    opacity="0.6"
                    transform={`rotate(${i * 45})`}
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* Rotating geometric pattern layer 2 - opposite direction */}
          <div className="absolute inset-16" style={{animation: 'mandalaRotate 15s linear infinite reverse'}}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <g transform="translate(100,100)">
                {[...Array(8)].map((_, i) => (
                  <path
                    key={i}
                    d="M0,-60 L15,-45 L0,-30 L-15,-45 Z"
                    fill="rgb(252, 211, 77)"
                    opacity="0.5"
                    transform={`rotate(${i * 45})`}
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* Central 8-pointed Islamic star */}
          <div className="absolute inset-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{animation: 'petalBloom 4s ease-in-out infinite'}}>
              <defs>
                <radialGradient id="starGradient">
                  <stop offset="0%" stopColor="rgb(251, 191, 36)" />
                  <stop offset="100%" stopColor="rgb(217, 119, 6)" />
                </radialGradient>
              </defs>
              <path
                d="M50,5 L57,35 L87,35 L63,52 L70,82 L50,65 L30,82 L37,52 L13,35 L43,35 Z"
                fill="url(#starGradient)"
                stroke="rgb(251, 191, 36)"
                strokeWidth="1.5"
              />
              <circle cx="50" cy="50" r="12" fill="rgb(120, 53, 15)" stroke="rgb(251, 191, 36)" strokeWidth="2"/>
            </svg>
          </div>

          {/* Orbiting crescent moons */}
          <div className="absolute inset-0" style={{animation: 'mandalaRotate 10s linear infinite'}}>
            {[0, 90, 180, 270].map((angle, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-130px)`,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-amber-400">
                  <path
                    d="M12 2C9.5 2 7 3 6 6C7 9 9.5 10 12 10C9.5 10 7 11 6 14C7 17 9.5 18 12 18C7 18 3 14 3 9.5C3 5 7 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Elegant Loading Text with Arabic Style */}
        <div className="text-center space-y-6">
          {/* Animated dots with Arabic pattern */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400"
                style={{
                  animation: `bismillahPulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-amber-200 tracking-[0.2em]">
              جَارٍ التَّحْمِيل
            </h2>
            <p className="text-amber-300/80 text-sm tracking-[0.3em] uppercase">
              Loading
            </p>
          </div>

          <p className="text-amber-400/60 text-xs italic max-w-md mx-auto">
            &quot;And whoever puts their trust in Allah, He will be sufficient for them&quot;
          </p>
        </div>

        {/* Bottom Islamic Arch Decoration */}
        <div className="flex gap-6 items-end opacity-30">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg
              key={i}
              width="50"
              height="60"
              viewBox="0 0 50 60"
              className="text-amber-400"
              style={{
                animation: `petalBloom ${3 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            >
              <path
                d="M 5 60 Q 5 30 25 5 Q 45 30 45 60 Z"
                fill="currentColor"
                opacity="0.6"
              />
              <path
                d="M 10 60 Q 10 35 25 15 Q 40 35 40 60 Z"
                fill="currentColor"
                opacity="0.3"
              />
              <circle cx="25" cy="15" r="3" fill="currentColor" />
            </svg>
          ))}
        </div>
      </div>

      {/* Mystical ambient lighting */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}