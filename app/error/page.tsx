"use client"
import React from 'react';

export default function IslamicErrorPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F3] flex items-center justify-center overflow-hidden relative">
      {/* Islamic Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, #8A1538 0, #8A1538 1px, transparent 0, transparent 50%),
            repeating-linear-gradient(-45deg, #8A1538 0, #8A1538 1px, transparent 0, transparent 50%)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Floating Geometric Shapes */}
      <div className="absolute w-[200px] h-[200px] top-[10%] left-[10%] border-2 border-[#8A1538]/10 rotate-45 animate-[float_20s_infinite_ease-in-out]" />
      <div className="absolute w-[150px] h-[150px] bottom-[15%] right-[15%] border-2 border-[#8A1538]/10 rotate-[30deg] animate-[float_20s_infinite_ease-in-out] [animation-delay:5s]" />
      <div className="absolute w-[100px] h-[100px] top-[60%] left-[5%] border-2 border-[#8A1538]/10 rounded-full animate-[float_20s_infinite_ease-in-out] [animation-delay:10s]" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-10 max-w-2xl">
        {/* Top Ornament */}
        <div className="w-[150px] h-10 mx-auto mb-8 relative">
          <div className="absolute left-0 top-1/2 w-[60px] h-0.5 bg-[#8A1538]" />
          <div className="absolute right-0 top-1/2 w-[60px] h-0.5 bg-[#8A1538]" />
          <div className="absolute left-1/2 top-1/2 w-5 h-5 bg-[#8A1538] rotate-45 -ml-2.5 -mt-2.5" />
        </div>

        {/* Error Code */}
        <div className="text-[140px] md:text-[180px] font-bold text-[#8A1538] leading-none mb-5 animate-[fadeInScale_0.8s_ease-out]">
          404
        </div>

        {/* Arabic Text */}
        <div className="text-3xl md:text-4xl text-[#8A1538] mb-4 font-bold animate-[fadeIn_1s_ease-out_0.3s_both]">
          الصفحة غير موجودة
        </div>

        {/* English Heading */}
        <h1 className="text-3xl md:text-4xl text-[#8A1538] mb-5 font-bold animate-[fadeIn_1s_ease-out_0.4s_both]">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-[#8A1538]/80 leading-relaxed mb-10 animate-[fadeIn_1s_ease-out_0.5s_both]">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable. Let us guide you back to the right path.
        </p>

        {/* Buttons */}
        <div className="flex gap-5 justify-center flex-wrap animate-[fadeIn_1s_ease-out_0.6s_both]">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-10 py-4 text-base font-semibold rounded-lg bg-[#8A1538] text-[#FFF9F3] shadow-[0_4px_15px_rgba(138,21,56,0.3)] transition-all duration-300 hover:bg-[#6d1029] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(138,21,56,0.4)]"
          >
            Return Home
          </button>
          <button 
            onClick={() => window.history.back()}
            className="px-10 py-4 text-base font-semibold rounded-lg bg-transparent text-[#8A1538] border-2 border-[#8A1538] transition-all duration-300 hover:bg-[#8A1538]/10 hover:-translate-y-0.5"
          >
            Go Back
          </button>
        </div>

        {/* Bottom Ornament */}
        <div className="w-[200px] h-[60px] mx-auto mt-10 relative">
          <div 
            className="absolute left-1/2 top-1/2 w-[30px] h-[30px] bg-[#8A1538] -ml-[15px] -mt-[15px] animate-[pulse_2s_infinite]"
            style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
          <div className="absolute right-[55%] top-1/2 w-[70px] h-0.5 bg-gradient-to-l from-[#8A1538] to-transparent" />
          <div className="absolute left-[55%] top-1/2 w-[70px] h-0.5 bg-gradient-to-r from-[#8A1538] to-transparent" />
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700&display=swap');
        
        div {
          font-family: 'Cairo', sans-serif;
        }
        
        .text-3xl, .text-4xl, .text-\\[140px\\], .text-\\[180px\\] {
          font-family: 'Amiri', serif;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(45deg); }
          25% { transform: translate(20px, -20px) rotate(55deg); }
          50% { transform: translate(-20px, 20px) rotate(35deg); }
          75% { transform: translate(20px, 20px) rotate(50deg); }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.8; 
          }
        }
      `}</style>
    </div>
  );
}