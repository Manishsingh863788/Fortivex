import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

export default function SentimentBadge({ sentiment, score }) {
  const norm = (sentiment || 'Neutral').toLowerCase();

  if (norm.includes('pos')) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <Smile className="w-3.5 h-3.5 text-emerald-400" />
        <span>Positive {typeof score === 'number' && score !== 0 ? `(${score > 0 ? '+' : ''}${score})` : ''}</span>
      </span>
    );
  }

  if (norm.includes('neg')) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <Frown className="w-3.5 h-3.5 text-rose-400" />
        <span>Negative {typeof score === 'number' && score !== 0 ? `(${score})` : ''}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-600/30">
      <Meh className="w-3.5 h-3.5 text-slate-400" />
      <span>Neutral</span>
    </span>
  );
}
