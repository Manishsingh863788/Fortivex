import Vapi from '@vapi-ai/web';
import { api } from './api';

class VoiceAgentController {
  constructor() {
    this.vapi = null;
    this.isVapiConfigured = false;
    this.activeMode = 'webspeech'; // 'vapi' | 'webspeech'
    this.recognition = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isCallActive = false;
    this.startTime = null;
    this.durationTimer = null;
    this.callDuration = 0;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;

    // Event callbacks
    this.onStatusChange = null;
    this.onTranscript = null;
    this.onSpeakingChange = null;
    this.onAudioVolume = null;
    this.onError = null;

    this._initVapi();
  }

  _initVapi() {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (publicKey && !publicKey.includes('your_vapi')) {
      try {
        this.vapi = new Vapi(publicKey);
        this.isVapiConfigured = true;
        this.activeMode = 'vapi';
        this._setupVapiListeners();
      } catch (err) {
        console.warn('[VoiceAgentController] Vapi init error, fallback to WebSpeech:', err);
      }
    }
  }

  _setupVapiListeners() {
    if (!this.vapi) return;

    this.vapi.on('call-start', () => {
      this.isCallActive = true;
      this._startTimer();
      if (this.onStatusChange) this.onStatusChange('connected');
    });

    this.vapi.on('call-end', () => {
      this.isCallActive = false;
      this._stopTimer();
      if (this.onStatusChange) this.onStatusChange('disconnected');
      if (this.onSpeakingChange) this.onSpeakingChange('idle');
    });

    this.vapi.on('speech-start', () => {
      if (this.onSpeakingChange) this.onSpeakingChange('agent');
    });

    this.vapi.on('speech-end', () => {
      if (this.onSpeakingChange) this.onSpeakingChange('idle');
    });

    this.vapi.on('message', (msg) => {
      if (msg.type === 'transcript') {
        const speaker = msg.role === 'assistant' ? 'agent' : 'customer';
        if (this.onTranscript) {
          this.onTranscript({
            speaker,
            message: msg.transcript,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    this.vapi.on('error', (err) => {
      console.error('[VoiceAgentController Vapi Error]', err);
      if (this.onError) this.onError(err.message || 'Vapi voice error');
    });
  }

  async startCall({ assistantId, onGreeting = null } = {}) {
    if (this.isCallActive) return;

    try {
      // 1. Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._setupAudioAnalyser(this.mediaStream);

      this.isCallActive = true;
      this._startTimer();

      if (this.activeMode === 'vapi' && this.vapi && assistantId) {
        if (this.onStatusChange) this.onStatusChange('connecting');
        await this.vapi.start(assistantId);
      } else {
        // Run with Native Web Speech STT & TTS + Backend RAG pipeline
        if (this.onStatusChange) this.onStatusChange('connected');
        this._startWebSpeechRecognition();

        // Initial agent greeting
        const greeting = onGreeting || "Hello! Welcome to TechNova Solutions. I'm Alex, your AI sales assistant. Are you looking to build an e-commerce website, custom web application, or explore AI solutions?";
        this.speakText(greeting);
        if (this.onTranscript) {
          this.onTranscript({
            speaker: 'agent',
            message: greeting,
            timestamp: new Date().toISOString(),
            sentiment: 'Positive'
          });
        }
      }
    } catch (err) {
      this.isCallActive = false;
      this._stopTimer();
      if (this.onStatusChange) this.onStatusChange('error');
      if (this.onError) this.onError(`Microphone access error: ${err.message}`);
      throw err;
    }
  }

  async endCall() {
    if (!this.isCallActive) return;

    this.isCallActive = false;
    this._stopTimer();

    if (this.activeMode === 'vapi' && this.vapi) {
      try { this.vapi.stop(); } catch (e) { console.warn(e); }
    }

    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) { console.warn(e); }
      this.recognition = null;
    }

    if (this.synth) {
      this.synth.cancel();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { await this.audioContext.close(); } catch (e) {}
    }

    if (this.onStatusChange) this.onStatusChange('disconnected');
    if (this.onSpeakingChange) this.onSpeakingChange('idle');
  }

  // Speak agent message using Web Speech Synthesis
  speakText(text, onComplete = null) {
    if (!this.synth) return;
    this.synth.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try selecting a natural sounding English voice
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      if (this.onSpeakingChange) this.onSpeakingChange('agent');
    };

    utterance.onend = () => {
      if (this.onSpeakingChange) this.onSpeakingChange('idle');
      if (onComplete) onComplete();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (this.onSpeakingChange) this.onSpeakingChange('idle');
    };

    this.synth.speak(utterance);
  }

  _startWebSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Browser does not support Web Speech Recognition');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('[WebSpeech] Recognition active');
    };

    this.recognition.onresult = async (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim();

      if (transcript && this.isCallActive) {
        if (this.onSpeakingChange) this.onSpeakingChange('customer');

        // Analyze sentiment of customer phrase
        let sentiment = 'Neutral';
        try {
          const sentRes = await api.analyzeSentiment(transcript);
          if (sentRes.success) sentiment = sentRes.data.sentiment;
        } catch (e) {}

        if (this.onTranscript) {
          this.onTranscript({
            speaker: 'customer',
            message: transcript,
            timestamp: new Date().toISOString(),
            sentiment
          });
        }

        // Query Backend RAG AI for context-aware reply
        try {
          const aiRes = await api.sendChatMessage({ message: transcript });
          if (aiRes.success && aiRes.data.reply) {
            const reply = aiRes.data.reply;

            if (this.onTranscript) {
              this.onTranscript({
                speaker: 'agent',
                message: reply,
                timestamp: new Date().toISOString(),
                sentiment: 'Positive',
                retrieved_chunks: aiRes.data.retrieved_chunks
              });
            }

            this.speakText(reply);
          }
        } catch (err) {
          console.error('[WebSpeech AI Query Error]', err);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[WebSpeech error]', event.error);
    };

    this.recognition.onend = () => {
      // Auto-restart recognition if call is still active
      if (this.isCallActive && this.recognition) {
        try { this.recognition.start(); } catch (e) {}
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('[WebSpeech start error]', e);
    }
  }

  _setupAudioAnalyser(stream) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.isCallActive) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        if (this.onAudioVolume) {
          this.onAudioVolume(normalized);
        }
        requestAnimationFrame(checkVolume);
      };

      requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('[AudioContext setup error]', e);
    }
  }

  _startTimer() {
    this.callDuration = 0;
    this.startTime = Date.now();
    this.durationTimer = setInterval(() => {
      this.callDuration = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  _stopTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  }

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const voiceAgent = new VoiceAgentController();
