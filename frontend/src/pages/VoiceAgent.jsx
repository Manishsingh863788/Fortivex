import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneCall, 
  PhoneOff, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  BookOpen, 
  BrainCircuit, 
  AlertCircle,
  FileText,
  User,
  Bot,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AudioVisualizer from '../components/AudioVisualizer';
import LeadStatusBadge from '../components/LeadStatusBadge';
import SentimentBadge from '../components/SentimentBadge';
import Modal from '../components/Modal';
import { voiceAgent } from '../services/vapiService';
import { api } from '../services/api';

export default function VoiceAgent({ setActivePage }) {
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'connecting' | 'connected' | 'disconnected'
  const [speakerState, setSpeakerState] = useState('idle'); // 'idle' | 'agent' | 'customer'
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcripts, setTranscripts] = useState([]);
  const [liveLead, setLiveLead] = useState({
    name: 'Inbound Visitor',
    email: '',
    phone: '',
    budget: '',
    timeline: '',
    requirements: '',
    lead_status: 'WARM',
    sentiment: 'Positive',
    qualification_reason: 'Awaiting customer requirements during live consultation.'
  });
  const [lastRetrievedChunk, setLastRetrievedChunk] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [callSummary, setCallSummary] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Hook into Voice Agent Controller events
  useEffect(() => {
    voiceAgent.onStatusChange = (status) => setCallStatus(status);
    voiceAgent.onSpeakingChange = (speaker) => setSpeakerState(speaker);
    voiceAgent.onAudioVolume = (vol) => setVolume(vol);
    voiceAgent.onError = (err) => setErrorMsg(err);

    voiceAgent.onTranscript = (transcriptObj) => {
      setTranscripts(prev => [...prev, transcriptObj]);

      // If RAG retrieved chunks are attached, update preview
      if (transcriptObj.retrieved_chunks && transcriptObj.retrieved_chunks.length > 0) {
        setLastRetrievedChunk(transcriptObj.retrieved_chunks[0]);
      }

      // Automatically update live lead qualification state
      triggerLiveQualification(transcriptObj);
    };

    const timer = setInterval(() => {
      if (voiceAgent.isCallActive) {
        setDuration(voiceAgent.callDuration);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const triggerLiveQualification = async (newTranscript) => {
    try {
      // Periodic BANT qualification trigger
      const allMsgs = [...transcripts, newTranscript];
      if (allMsgs.length >= 2) {
        const res = await api.qualifyLead(allMsgs);
        if (res.success && res.data) {
          setLiveLead(prev => ({ ...prev, ...res.data }));
        }
      }
    } catch (e) {
      console.warn('Live qualification update error:', e);
    }
  };

  const handleStartCall = async () => {
    setErrorMsg('');
    try {
      setTranscripts([]);
      await voiceAgent.startCall();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start call. Ensure microphone permissions are allowed.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const text = manualInput.trim();
    if (!text) return;
    setManualInput('');

    if (callStatus !== 'connected') {
      try {
        await voiceAgent.startCall();
      } catch (err) {
        voiceAgent.isCallActive = true;
        setCallStatus('connected');
      }
    }

    voiceAgent.processUserUtterance(text);
  };

  const handleEndCall = async () => {
    const finalDuration = duration;
    await voiceAgent.endCall();

    if (transcripts.length > 0) {
      // Qualify and summarize completed call
      try {
        const qualRes = await api.qualifyLead(transcripts);
        const qualData = qualRes.success ? qualRes.data : {};

        // 1. Save or update lead in CRM
        const leadRecord = await api.createLead({
          name: qualData.customer_name || liveLead.name || 'Inbound Prospect',
          email: qualData.email || liveLead.email || null,
          phone: qualData.phone || liveLead.phone || null,
          requirements: qualData.requirements || 'E-commerce platform inquiry',
          budget: qualData.budget || liveLead.budget || '₹50,000',
          timeline: qualData.timeline || liveLead.timeline || 'Next month',
          lead_status: qualData.lead_status || 'HOT',
          sentiment: qualData.sentiment || 'Positive',
          qualification_reason: qualData.qualification_reason || 'Qualified through autonomous sales agent.'
        });

        // 2. Save conversation record with transcript
        const convRes = await api.saveConversation({
          lead_id: leadRecord.data?.id,
          call_duration: finalDuration,
          sentiment: qualData.sentiment || 'Positive',
          sentiment_score: qualData.sentiment_score || 0.85,
          summary: qualData.summary,
          action_items: qualData.action_items,
          objections: qualData.objections,
          transcripts: transcripts
        });

        setCallSummary({
          ...qualData,
          duration: finalDuration,
          leadId: leadRecord.data?.id
        });
        setShowSummaryModal(true);
      } catch (err) {
        console.error('Error saving call summary:', err);
      }
    }
  };

  // Calendar Booking Helpers
  const openBookingModal = async () => {
    setIsBookingModalOpen(true);
    fetchSlots(bookingDate);
  };

  const fetchSlots = async (date) => {
    try {
      const res = await api.getAvailableSlots(date);
      if (res.success) {
        setAvailableSlots(res.data);
        const firstAvail = res.data.find(s => s.available);
        if (firstAvail) setSelectedSlot(firstAvail.time);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    setBookingSuccess(null);
    try {
      const res = await api.bookAppointment({
        customer_name: liveLead.name || 'Rahul Sharma',
        customer_email: liveLead.email || 'client@example.com',
        scheduled_time: selectedSlot,
        title: `TechNova Discovery Consultation - ${liveLead.name || 'Sales Prospect'}`,
        notes: `Budget: ${liveLead.budget || '₹50,000'} | Timeline: ${liveLead.timeline || 'Next month'}`
      });

      if (res.success) {
        setBookingSuccess(res.data);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        
        // Agent confirms via speech if call is still active
        if (callStatus === 'connected') {
          voiceAgent.speakText("Your discovery appointment has been confirmed with our team! I have synced it with Google Calendar and sent an invitation.");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border">
        <div className="flex items-center space-x-3">
          <div className={`w-3.5 h-3.5 rounded-full ${
            callStatus === 'connected' ? 'bg-emerald-400 animate-ping' :
            callStatus === 'connecting' ? 'bg-amber-400 animate-bounce' : 'bg-slate-600'
          }`} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {callStatus === 'connected' ? 'Call In Progress' :
                 callStatus === 'connecting' ? 'Connecting to Voice Pipeline...' : 'Voice Agent Ready'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue font-semibold">
                Dual Mode: Web Speech + Vapi
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {callStatus === 'connected' ? 'Live bidirectional audio interaction active' : 'Click "Start Voice Call" to converse with TechNova AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-700/80 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            <span>{voiceAgent.formatDuration(duration)}</span>
          </div>

          {callStatus !== 'connected' ? (
            <button
              onClick={handleStartCall}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Voice Call</span>
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End & Summarize Call</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Live Voice Stage + Side Qualification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stage & Transcripts (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Visualizer Stage */}
          <div className="glass-panel p-6 rounded-3xl border relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                speakerState === 'agent' ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/40 animate-pulse' :
                speakerState === 'customer' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse' :
                'bg-slate-800 text-slate-400'
              }`}>
                {speakerState === 'agent' ? '🗣️ Agent Speaking' :
                 speakerState === 'customer' ? '🎙️ Customer Speaking' : 'Listening...'}
              </span>
            </div>

            {/* Visualizer Waveform */}
            <div className="w-full max-w-md my-4">
              <AudioVisualizer
                isActive={callStatus === 'connected'}
                isSpeaking={speakerState !== 'idle'}
                volume={volume}
                speaker={speakerState}
              />
            </div>

            <p className="text-xs text-slate-400 text-center max-w-sm mt-2">
              {callStatus === 'connected'
                ? "Microphone is listening. Speak clearly into your mic to discuss requirements, pricing, or book an appointment."
                : "Microphone is offline. Click Start Voice Call above to test live voice interaction."}
            </p>
          </div>

          {/* Live Transcript Stream */}
          <div className="glass-panel p-6 rounded-3xl border flex flex-col h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-brand-blue" />
                <h3 className="font-bold text-white text-sm">Real-Time Conversation Stream</h3>
              </div>
              <span className="text-[11px] text-slate-400">{transcripts.length} exchanges</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Transcript will appear here in real-time</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Try asking: "Can you build an e-commerce website for ₹50,000?" or "What services do you provide?"
                    </p>
                  </div>
                </div>
              ) : (
                transcripts.map((t, idx) => {
                  const isAgent = t.speaker === 'agent';
                  return (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 ${isAgent ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isAgent ? 'bg-gradient-to-tr from-brand-purple to-pink-600 text-white' : 'bg-brand-blue text-white'
                      }`}>
                        {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                        isAgent
                          ? 'bg-navy-800 border border-slate-700/80 text-slate-100 rounded-tl-sm'
                          : 'bg-gradient-to-br from-brand-blue/30 to-brand-purple/20 border border-brand-blue/30 text-white rounded-tr-sm'
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-1 text-[11px] text-slate-400">
                          <span className="font-bold text-slate-300">{isAgent ? 'TechNova AI (Alex)' : 'Customer'}</span>
                          {t.sentiment && <SentimentBadge sentiment={t.sentiment} />}
                        </div>
                        <p className="leading-relaxed">{t.message}</p>

                        {/* RAG Citation Pill if available */}
                        {t.retrieved_chunks && t.retrieved_chunks.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center space-x-1.5 text-[10px] text-brand-blue font-mono">
                            <BookOpen className="w-3 h-3" />
                            <span>Grounded via RAG: {t.retrieved_chunks[0]?.metadata?.title || 'Knowledge Base'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Quick Interactive Input Box (Voice or Type) */}
            <form onSubmit={handleManualSubmit} className="pt-3 border-t border-slate-800 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                placeholder={callStatus === 'connected' ? "Type a requirement, question, or speak into mic..." : "Type here or click Start Voice Call to test..."}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live BANT Qualification & RAG Insight */}
        <div className="space-y-6">
          {/* Live Lead Qualification Card */}
          <div className="glass-panel p-6 rounded-3xl border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Live Lead Qualification</h3>
              </div>
              <LeadStatusBadge status={liveLead.lead_status} />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Identity:</span>
                <span className="text-white font-semibold text-sm">{liveLead.name || 'Anonymous Visitor'}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Extracted Requirements:</span>
                <p className="text-slate-200 mt-0.5 leading-snug">{liveLead.requirements || 'Discussing project parameters...'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Budget (B):</span>
                  <span className="font-bold text-emerald-400 text-sm">{liveLead.budget || 'Inquiring'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Timeline (T):</span>
                  <span className="font-bold text-amber-300 text-sm">{liveLead.timeline || 'Flexible'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">BANT Rationale:</span>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  {liveLead.qualification_reason}
                </p>
              </div>
            </div>

            {/* Appointment Booking Trigger */}
            <div className="pt-2">
              <button
                onClick={openBookingModal}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-xs hover:opacity-95 shadow-md shadow-brand-blue/20 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Discovery Call (Google Calendar)</span>
              </button>
            </div>
          </div>

          {/* RAG Knowledge Grounding Inspector */}
          <div className="glass-panel p-6 rounded-3xl border space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Active RAG Grounding</h3>
            </div>

            {lastRetrievedChunk ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-medium text-slate-300">{lastRetrievedChunk.metadata?.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px]">
                    Sim: {Math.round(lastRetrievedChunk.similarity * 100)}%
                  </span>
                </div>
                <p className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-slate-300 text-[11px] leading-relaxed italic">
                  "{lastRetrievedChunk.content}"
                </p>
                <p className="text-[10px] text-slate-400">
                  Strict hallucination guardrail: AI only answers from validated TechNova docs.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                When you ask a question about TechNova pricing, SLAs, or services, the top vector-matched knowledge chunks will be inspected here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => { setIsBookingModalOpen(false); setBookingSuccess(null); }}
        title="Schedule Complimentary Discovery Consultation"
      >
        {bookingSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Appointment Confirmed!</h4>
              <p className="text-sm text-slate-300 mt-1">
                Synced with Google Calendar & TechNova Solutions CRM.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-left text-xs space-y-2">
              <p><span className="text-slate-400">Client:</span> <span className="font-semibold text-white">{bookingSuccess.customer_name}</span></p>
              <p><span className="text-slate-400">Time:</span> <span className="font-semibold text-white">{new Date(bookingSuccess.scheduled_time).toLocaleString()}</span></p>
              <p><span className="text-slate-400">Meet Link:</span> <a href={bookingSuccess.google_meet_link} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline break-all">{bookingSuccess.google_meet_link}</a></p>
            </div>
            <button
              onClick={() => { setIsBookingModalOpen(false); setBookingSuccess(null); }}
              className="px-6 py-2.5 rounded-xl bg-brand-blue text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Consultation Date</label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  fetchSlots(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Available 30-Minute Time Slots</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedSlot === slot.time
                        ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-md shadow-brand-blue/30'
                        : slot.available
                        ? 'bg-navy-900 text-slate-200 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.formattedTime}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedSlot || bookingLoading}
                onClick={handleConfirmBooking}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-xs hover:opacity-95 disabled:opacity-50"
              >
                {bookingLoading ? 'Confirming with Google Calendar...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Post-Call Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="AI Call Summary & Business Intelligence"
        maxWidth="max-w-2xl"
      >
        {callSummary && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-900 border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Prospect Analyzed</p>
                <h4 className="text-lg font-bold text-white">{callSummary.customer_name || 'Prospect'}</h4>
              </div>
              <div className="text-right">
                <LeadStatusBadge status={callSummary.lead_status} />
                <p className="text-[11px] text-slate-400 mt-1">Duration: {callSummary.duration}s</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">Executive Summary</h5>
              <p className="text-sm text-slate-200 leading-relaxed bg-navy-900/60 p-3.5 rounded-xl border border-slate-800">
                {callSummary.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Requirements:</span>
                <p className="text-xs font-medium text-white">{callSummary.requirements}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Budget & Timeline:</span>
                <p className="text-xs font-medium text-emerald-400">{callSummary.budget} • {callSummary.timeline}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Recommended Sales Action Items</h5>
              <ul className="space-y-1.5">
                {(callSummary.action_items || []).map((item, i) => (
                  <li key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lead saved in CRM & Supabase
              </span>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setActivePage('leads-crm');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-blue text-white font-semibold text-xs hover:bg-blue-600 transition-colors"
              >
                View in Leads CRM →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
