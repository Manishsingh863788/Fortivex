import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Calendar, Cpu, Bell } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activePageTitle }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.getStatus()
      .then(res => { if (res.success) setStatus(res); })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-navy-800/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{activePageTitle}</h2>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
          Enterprise Edition
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Supabase / Storage Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-900/80 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-brand-blue" />
          <span className="text-slate-300">DB:</span>
          <span className="text-emerald-400 font-medium">
            {status?.database?.connected ? 'Supabase pgvector' : 'Local Hybrid Store'}
          </span>
        </div>

        {/* AI Engine Status */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-900/80 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-brand-purple" />
          <span className="text-slate-300">Model:</span>
          <span className="text-brand-purple font-medium">
            {status?.openai?.configured ? status.openai.model : 'Heuristic RAG Engine'}
          </span>
        </div>

        {/* Google Calendar Status */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-900/80 border border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">G-Cal:</span>
          <span className="text-amber-300 font-medium">
            {status?.calendar?.configured ? 'Cloud Synced' : 'Ready'}
          </span>
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
            TN
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-200">TechNova Sales</p>
            <p className="text-[10px] text-slate-400">Admin Account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
