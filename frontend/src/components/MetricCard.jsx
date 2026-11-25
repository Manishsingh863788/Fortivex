import React from 'react';

export default function MetricCard({ title, value, change, trend = 'up', icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-cyan-500/10 text-brand-blue border-blue-500/20',
    purple: 'from-purple-500/20 to-pink-500/10 text-brand-purple border-purple-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border glass-panel-hover flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} border`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {change && (
          <div className="flex items-center space-x-1.5 mt-1">
            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-slate-400'}`}>
              {change}
            </span>
            <span className="text-[11px] text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
