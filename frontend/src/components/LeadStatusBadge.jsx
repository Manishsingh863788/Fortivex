import React from 'react';
import { Flame, Compass, Snowflake } from 'lucide-react';

export default function LeadStatusBadge({ status }) {
  const normalized = (status || 'WARM').toUpperCase();

  if (normalized === 'HOT') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
        <span>HOT LEAD</span>
      </span>
    );
  }

  if (normalized === 'WARM') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <Compass className="w-3 h-3 text-amber-500" />
        <span>WARM LEAD</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
      <Snowflake className="w-3 h-3 text-blue-400" />
      <span>COLD LEAD</span>
    </span>
  );
}
