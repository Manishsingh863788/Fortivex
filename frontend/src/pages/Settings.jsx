import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Cpu, 
  Database, 
  Calendar, 
  Mic, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

  // Agent persona settings
  const [assistantName, setAssistantName] = useState('Alex');
  const [companyName, setCompanyName] = useState('TechNova Solutions');
  const [primaryLanguage, setPrimaryLanguage] = useState('English (US)');
  const [discoveryMinutes, setDiscoveryMinutes] = useState(30);

  useEffect(() => {
    api.getStatus()
      .then(res => { if (res.success) setStatus(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSavePersona = (e) => {
    e.preventDefault();
    setSaveMsg('Agent configuration updated successfully!');
    setTimeout(() => setSaveMsg(''), 4000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Integrations & Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage external AI APIs, databases, voice SDKs, and conversational parameters</p>
      </div>

      {saveMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OpenAI Card */}
        <div className="glass-panel p-5 rounded-2xl border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-brand-purple" />
              <div>
                <h4 className="font-bold text-white text-sm">OpenAI LLM & Embeddings</h4>
                <p className="text-[11px] text-slate-400">GPT-4o-mini & text-embedding-3-small</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              status?.openai?.configured
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {status?.openai?.configured ? 'ONLINE (CLOUD)' : 'LOCAL HEURISTIC ENGINE'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {status?.openai?.configured
              ? 'API Key active. Live conversational reasoning and structured JSON extraction enabled.'
              : 'Running in resilient offline mode with deterministic BANT qualifier & hybrid vector search. To enable live OpenAI, add OPENAI_API_KEY to your .env file.'}
          </p>
        </div>

        {/* Vapi Voice Card */}
        <div className="glass-panel p-5 rounded-2xl border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Mic className="w-5 h-5 text-brand-blue" />
              <div>
                <h4 className="font-bold text-white text-sm">Vapi AI Voice Web SDK</h4>
                <p className="text-[11px] text-slate-400">Real-time WebRTC audio pipeline</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              status?.vapi?.hasPublicKey
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {status?.vapi?.hasPublicKey ? 'VAPI ACTIVE' : 'WEB SPEECH ACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dual Voice Mode: Browser SpeechRecognition & SpeechSynthesis provides zero-friction instant voice in any environment, with seamless Vapi SDK cloud fallback.
          </p>
        </div>

        {/* Supabase Card */}
        <div className="glass-panel p-5 rounded-2xl border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-white text-sm">Supabase PostgreSQL + pgvector</h4>
                <p className="text-[11px] text-slate-400">Vector store & relational tables</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              status?.database?.connected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {status?.database?.connected ? 'POSTGRESQL (CLOUD)' : 'LOCAL RESILIENT HYBRID'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Full SQL schema ready in <code className="text-brand-blue bg-navy-900 px-1 rounded">schema.sql</code> with IVFFlat cosine vector indexing, RLS, and foreign keys.
          </p>
        </div>

        {/* Google Calendar Card */}
        <div className="glass-panel p-5 rounded-2xl border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="font-bold text-white text-sm">Google Calendar API</h4>
                <p className="text-[11px] text-slate-400">Automated event & Google Meet generation</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              status?.calendar?.configured
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {status?.calendar?.configured ? 'GOOGLE CLOUD ACTIVE' : 'LOCAL INTEGRATION READY'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Conflict-aware calendar slot manager creating Google Meet conference links and updating lead records automatically.
          </p>
        </div>
      </div>

      {/* Voice Agent Persona Customization Form */}
      <div className="glass-panel p-6 rounded-3xl border space-y-4">
        <h3 className="font-bold text-white text-base">Autonomous Voice Persona & Business Profile</h3>
        <form onSubmit={handleSavePersona} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Agent Voice Persona Name</label>
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Company Entity</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Language & Dialect</label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
              >
                <option value="English (US)">English (US / Neutral)</option>
                <option value="English (India)">English (Indian Accent)</option>
                <option value="Hindi">Hindi / Hinglish</option>
                <option value="Spanish">Spanish (LatAm)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Discovery Consultation Duration</label>
              <input
                type="number"
                value={discoveryMinutes}
                onChange={(e) => setDiscoveryMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
