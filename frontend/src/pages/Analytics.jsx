import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Smile, 
  Meh, 
  Frown, 
  ShieldAlert, 
  Flame, 
  Target,
  ArrowUpRight
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { api } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => { if (res.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sentiment = data?.sentimentBreakdown || { positive: 65, neutral: 25, negative: 10 };
  const metrics = data?.metrics || {
    totalCalls: 12,
    totalLeads: 8,
    hotLeads: 3,
    conversionRate: 37.5
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Sales Intelligence & Call Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time performance indicators, customer sentiment analysis, and objection radar</p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Conversion Efficiency"
          value={`${metrics.conversionRate}%`}
          change="+8.2%"
          trend="up"
          icon={Target}
          color="emerald"
        />
        <MetricCard
          title="Positive Sentiment Rate"
          value={`${sentiment.positive}%`}
          change="+12%"
          trend="up"
          icon={Smile}
          color="blue"
        />
        <MetricCard
          title="Average Call Duration"
          value="2m 24s"
          change="-15s"
          trend="up"
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="BANT High Intent Rate"
          value="42%"
          change="+5%"
          trend="up"
          icon={Flame}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis Distribution */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Customer Sentiment Breakdown</h3>
              <span className="text-xs text-slate-400">Natural Language Inference</span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Smile className="w-4 h-4" /> Positive (Enthusiastic / Ready to Buy)
                  </span>
                  <span className="text-white">{sentiment.positive}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${sentiment.positive}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Meh className="w-4 h-4 text-slate-400" /> Neutral (Informational Scoping)
                  </span>
                  <span className="text-white">{sentiment.neutral}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full transition-all duration-500" style={{ width: `${sentiment.neutral}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Frown className="w-4 h-4" /> Negative (Price or Timeline Hesitation)
                  </span>
                  <span className="text-white">{sentiment.negative}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${sentiment.negative}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 mt-6">
            Sentiment is updated after every customer turn using LLM and lexical nuance weighting.
          </div>
        </div>

        {/* Objection Radar Card */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Key Sales Objections Raised</h3>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: 'Payment gateway fees included in package?', count: 6, tag: 'Pricing Transparency' },
                { label: 'Security & HIPAA / GDPR compliance scope', count: 4, tag: 'Enterprise Policy' },
                { label: 'Can starter e-commerce launch within 3 weeks?', count: 3, tag: 'Timeline Feasibility' },
                { label: 'Custom mobile app offline sync capabilities', count: 2, tag: 'Technical Architecture' }
              ].map((obj, i) => (
                <div key={i} className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{obj.label}</p>
                    <span className="text-[10px] text-brand-blue font-medium">{obj.tag}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-bold text-xs">
                    {obj.count} calls
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 mt-4 flex items-center justify-between">
            <span>Objections feed back into RAG Playbook</span>
            <span className="text-emerald-400 font-semibold">Self-Optimizing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
