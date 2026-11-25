import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Users, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Mic, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LeadStatusBadge from '../components/LeadStatusBadge';
import SentimentBadge from '../components/SentimentBadge';
import { api } from '../services/api';

export default function Overview({ setActivePage }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => {
        if (res.success) setAnalytics(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const metrics = analytics?.metrics || {
    totalCalls: 12,
    totalLeads: 8,
    hotLeads: 3,
    warmLeads: 4,
    coldLeads: 1,
    appointmentsBooked: 4,
    conversionRate: 37.5
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-800 via-navy-700 to-indigo-950/60 p-8 border border-slate-700/60 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold border border-brand-blue/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TechNova Sales Copilot Active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Autonomous AI Sales Voice Command Center
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Empowering TechNova Solutions with real-time Speech-To-Text qualification, RAG retrieval, automated BANT scoring, and Google Calendar appointment booking.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActivePage('voice-agent')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-brand-blue/20 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Launch Live Voice Agent</span>
            </button>
            <button
              onClick={() => setActivePage('architecture')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-navy-900/80 hover:bg-navy-900 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
            >
              <span>View Architecture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Calls Handled"
          value={metrics.totalCalls}
          change="+18%"
          trend="up"
          icon={PhoneCall}
          color="blue"
        />
        <MetricCard
          title="Total Leads Generated"
          value={metrics.totalLeads}
          change="+24%"
          trend="up"
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Hot Qualified Leads"
          value={metrics.hotLeads}
          change="+35%"
          trend="up"
          icon={Flame}
          color="rose"
        />
        <MetricCard
          title="Appointments Booked"
          value={metrics.appointmentsBooked}
          change="+40%"
          trend="up"
          icon={Calendar}
          color="emerald"
        />
      </div>

      {/* Second Row: Funnel & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Funnel Card */}
        <div className="glass-panel p-6 rounded-2xl border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Lead Qualification Funnel</h3>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {metrics.conversionRate}% Conversion
              </span>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-400" /> Hot Leads (BANT Verified)</span>
                  <span className="font-bold text-white">{metrics.hotLeads}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(metrics.hotLeads / (metrics.totalLeads || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Warm Leads (Nurturing)</span>
                  <span className="font-bold text-white">{metrics.warmLeads}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(metrics.warmLeads / (metrics.totalLeads || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Cold Leads (Under budget)</span>
                  <span className="font-bold text-white">{metrics.coldLeads}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(metrics.coldLeads / (metrics.totalLeads || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Powered by BANT framework</span>
            <button onClick={() => setActivePage('leads-crm')} className="text-brand-blue hover:underline font-medium">
              View CRM →
            </button>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="glass-panel p-6 rounded-2xl border lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Recent AI Voice Consultations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time transcripts & BANT summaries</p>
            </div>
            <button onClick={() => setActivePage('call-history')} className="text-xs text-brand-blue hover:underline font-medium">
              All Calls →
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 mt-2">
            {(analytics?.recentConversations || []).map((conv, idx) => (
              <div key={conv.id || idx} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm text-white">
                      {conv.lead?.name || 'Inbound Prospect'}
                    </p>
                    <SentimentBadge sentiment={conv.sentiment} score={conv.sentiment_score} />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {conv.call_duration || 120}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{conv.summary || 'Consultation regarding TechNova solutions'}</p>
                </div>

                <div className="shrink-0 text-right">
                  <LeadStatusBadge status={conv.lead?.lead_status || 'WARM'} />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
