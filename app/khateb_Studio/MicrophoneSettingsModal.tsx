/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MicrophoneSettingsModal({ open, onClose }: Props) {
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  useEffect(() => {
    if (!open) {
      // reset to default when closed
      setNoiseSuppression(true);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[110] w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-medium text-[#231217]">Microphone settings</h3>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#231217]">Toggle noise suppression</div>
              <div className="text-xs text-gray-500">Reduce background noise during the live</div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => setNoiseSuppression((s) => !s)}
              aria-pressed={noiseSuppression}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
                noiseSuppression ? "bg-[#8A1538]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-sm transition-transform ${
                  noiseSuppression ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Start Live button (full width) */}
          <div>
            <button
              onClick={() => {
                // placeholder action; close modal
                onClose();
              }}
              className="w-full bg-[#7A1233] hover:bg-[#6d1029] text-white text-sm font-medium px-4 py-3 rounded-lg"
            >
              Start live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
