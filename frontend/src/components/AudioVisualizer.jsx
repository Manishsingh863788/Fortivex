import React from 'react';

export default function AudioVisualizer({ isActive, isSpeaking, volume = 0, speaker = 'idle' }) {
  const bars = 24;

  return (
    <div className="flex items-center justify-center space-x-1.5 h-16 w-full py-2">
      {Array.from({ length: bars }).map((_, i) => {
        // Compute pseudo height or react to audio volume
        let height = 8;
        if (isActive) {
          if (isSpeaking) {
            // Speaker waveform
            const factor = Math.sin((i / bars) * Math.PI) * (volume > 5 ? volume : 40);
            height = Math.max(12, Math.min(60, factor + ((i % 3) * 8)));
          } else {
            height = 8 + (Math.sin(i) + 1) * 4;
          }
        }

        const isAgent = speaker === 'agent';
        const isCustomer = speaker === 'customer';

        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-75 ${
              !isActive
                ? 'bg-slate-700 h-2'
                : isAgent
                ? 'bg-gradient-to-t from-brand-purple to-pink-500'
                : isCustomer
                ? 'bg-gradient-to-t from-brand-blue to-cyan-400'
                : 'bg-slate-600'
            }`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
}
