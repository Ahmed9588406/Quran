'use client';

export function FatwaDetail({ fatwa, onClose }: { fatwa: any | null; onClose: () => void }) {
  if (!fatwa) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF5ED] border-2 border-[#f0e6e5] rounded-3xl shadow-2xl p-8 z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Decorative corner gradients */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#7b2030]/10 via-[#7b2030]/5 to-transparent rounded-bl-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#7b2030]/10 via-[#7b2030]/5 to-transparent rounded-tr-[100px] pointer-events-none" />
        
        {/* Header Section */}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="inline-block mb-3">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-[#7b2030] via-[#9a2a3f] to-[#7b2030] bg-clip-text text-transparent">
                  فتوى
                </h3>
                <div className="h-1 bg-gradient-to-r from-transparent via-[#7b2030] to-transparent rounded-full mt-1" />
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-[#f0e6e5] shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7b2030] to-[#9a2a3f] flex items-center justify-center text-white text-xs font-bold">
                    {(fatwa?.asker?.displayName ?? fatwa?.asker?.username ?? 'You')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {fatwa?.asker?.displayName ?? fatwa?.asker?.username ?? 'You'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-[#f0e6e5] shadow-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">
                    {fatwa?.createdAt ? new Date(fatwa.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="group text-gray-400 hover:text-[#7b2030] p-2.5 rounded-full hover:bg-white/50 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Close"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="group-hover:rotate-90 transition-transform duration-300">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Content Section */}
          <div className="space-y-5">
            {/* Question Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-[#f0e6e5]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7b2030] to-[#9a2a3f] flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-[#7b2030]">Question</h4>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {fatwa?.question ?? 'No content available.'}
              </div>
            </div>

            {/* Answer Section */}
            {fatwa?.answer && (
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-2xl p-6 shadow-sm border-2 border-green-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-green-800 mb-2">Answer</h4>
                    <p className="text-sm text-green-700 leading-relaxed">{fatwa.answer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Target Preacher Section */}
            {fatwa?.targetPreacher && (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 shadow-sm border-2 border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CFAE70] to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black">Target Preacher</h4>
                    <p className="text-sm text-purple-700 mt-0.5 font-medium">
                      {fatwa.targetPreacher.displayName ?? fatwa.targetPreacher.username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm ${
                  fatwa?.status === 'pending' 
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200' 
                    : fatwa?.status === 'rejected' 
                    ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                    : fatwa?.status === 'approved'
                    ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {fatwa?.status?.toUpperCase()}
                </span>
              </div>

              {/* Rejection Reason */}
              {fatwa?.rejectionReason && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  Reason: {fatwa.rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-[#f0e6e5]">
            <button 
              onClick={onClose} 
              className="group px-6 py-3 rounded-xl text-sm font-semibold border-2 border-[#7b2030] text-[#7b2030] hover:bg-gradient-to-r hover:from-[#7b2030] hover:to-[#9a2a3f] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}