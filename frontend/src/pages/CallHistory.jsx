import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Bot,
  MessageSquare,
  Search
} from 'lucide-react';
import SentimentBadge from '../components/SentimentBadge';
import LeadStatusBadge from '../components/LeadStatusBadge';
import Modal from '../components/Modal';
import { api } from '../services/api';

export default function CallHistory() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      if (res.success) setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = async (conv) => {
    setSelectedConv(conv);
    setIsModalOpen(true);
    try {
      const res = await api.getTranscripts(conv.id);
      if (res.success) setTranscripts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.lead?.name && c.lead.name.toLowerCase().includes(q)) ||
      (c.summary && c.summary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Call History & Audio Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">Auditable record of all autonomous sales voice sessions</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search call logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border text-slate-500">
            No voice conversation history recorded yet. Launch the Live Voice Agent to record a consultation.
          </div>
        ) : (
          filtered.map((conv) => (
            <div
              key={conv.id}
              className="glass-panel p-5 rounded-2xl border glass-panel-hover flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white text-base">
                    {conv.lead?.name || 'Inbound Prospect'}
                  </span>
                  <SentimentBadge sentiment={conv.sentiment} score={conv.sentiment_score} />
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {conv.call_duration || 120}s
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {conv.summary || 'Consultation session regarding TechNova software solutions.'}
                </p>

                {conv.action_items && conv.action_items.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {conv.action_items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        → {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {conv.lead && <LeadStatusBadge status={conv.lead.lead_status} />}
                <button
                  onClick={() => handleOpenConversation(conv)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700/80 hover:border-brand-blue text-xs font-semibold text-white transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
                  <span>View Transcript</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transcript Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Full Call Transcript & AI Summary"
        maxWidth="max-w-2xl"
      >
        {selectedConv && (
          <div className="space-y-5">
            {/* Summary Header */}
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Call Summary & Business Insights</h4>
                <SentimentBadge sentiment={selectedConv.sentiment} score={selectedConv.sentiment_score} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedConv.summary}</p>
            </div>

            {/* Objections & Action Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="font-semibold text-slate-400 block mb-1">Customer Objections:</span>
                {selectedConv.objections && selectedConv.objections.length > 0 ? (
                  <ul className="list-disc pl-4 text-rose-300 space-y-0.5">
                    {selectedConv.objections.map((obj, i) => <li key={i}>{obj}</li>)}
                  </ul>
                ) : (
                  <span className="text-slate-500 italic">None detected</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="font-semibold text-slate-400 block mb-1">Action Items:</span>
                <ul className="space-y-1 text-slate-300">
                  {(selectedConv.action_items || []).map((action, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand-blue shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcripts List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Complete Transcript History</h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {transcripts.length === 0 ? (
                  <p className="text-xs text-slate-500">No transcripts recorded for this session.</p>
                ) : (
                  transcripts.map((t, i) => {
                    const isAgent = t.speaker === 'agent';
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs ${
                          isAgent
                            ? 'bg-navy-900 border-slate-800 text-slate-200'
                            : 'bg-brand-blue/10 border-brand-blue/20 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-slate-300">{isAgent ? 'TechNova AI' : 'Customer'}</span>
                          <span>{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{t.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
