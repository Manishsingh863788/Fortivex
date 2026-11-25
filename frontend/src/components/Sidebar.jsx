import React from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  Users, 
  PhoneCall, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings, 
  Network,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'voice-agent', label: 'Live AI Voice Agent', icon: Mic, badge: 'LIVE' },
  { id: 'leads-crm', label: 'Leads CRM', icon: Users },
  { id: 'call-history', label: 'Call History', icon: PhoneCall },
  { id: 'knowledge-base', label: 'Knowledge Base (RAG)', icon: BookOpen },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'architecture', label: 'System Architecture', icon: Network, highlight: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-64 bg-navy-800 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center glow-blue">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">FORTIVEX <span className="text-brand-blue">AI</span></h1>
            <p className="text-xs text-slate-400 font-medium">TechNova Voice Agent</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 text-white border-l-4 border-brand-blue'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-blue' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                    DIAGRAM
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center justify-between bg-navy-900/60 p-3 rounded-lg border border-slate-800/80">
          <div>
            <p className="font-medium text-slate-300">Client Engine</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Autonomous Online
            </p>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
