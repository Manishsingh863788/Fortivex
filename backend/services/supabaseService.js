import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'local_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data if local store doesn't exist
const INITIAL_STORE = {
  leads: [
    {
      id: "lead-101",
      name: "Rahul Sharma",
      email: "rahul.sharma@bizcraft.in",
      phone: "+91 98765 43210",
      requirements: "E-commerce platform for handcrafted ethnic apparel with payment gateway",
      budget: "₹50,000",
      timeline: "Next month (3-4 weeks)",
      lead_status: "HOT",
      sentiment: "Positive",
      qualification_reason: "High purchase intent, budget matches TechNova starter e-commerce package (₹45k-₹60k), clear timeline.",
      source: "Voice Agent",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "lead-102",
      name: "Priya Nair",
      email: "priya@zenithhealth.org",
      phone: "+91 98112 34567",
      requirements: "Doctor appointment booking web app with SMS notifications",
      budget: "₹1,20,000",
      timeline: "6 weeks",
      lead_status: "WARM",
      sentiment: "Neutral",
      qualification_reason: "Interested in custom healthcare portal, requesting security & HIPAA compliance details before signoff.",
      source: "Voice Agent",
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: "lead-103",
      name: "Amit Patel",
      email: "amit.patel@gmail.com",
      phone: "+91 97234 56789",
      requirements: "General inquiry regarding AI chatbots, no immediate project",
      budget: "Under ₹10,000",
      timeline: "Exploring / Next year",
      lead_status: "COLD",
      sentiment: "Neutral",
      qualification_reason: "Budget significantly below minimum entry tier, no defined commercial timeline.",
      source: "Voice Agent",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  conversations: [
    {
      id: "conv-201",
      lead_id: "lead-101",
      call_duration: 142,
      status: "completed",
      sentiment: "Positive",
      sentiment_score: 0.88,
      summary: "Customer Rahul inquired about building an e-commerce website with a budget of ₹50,000 to launch next month. Verified TechNova starter package fits budget. Scheduled discovery consultation for 27 Nov 2026.",
      action_items: [
        "Send calendar invite confirmation to rahul.sharma@bizcraft.in",
        "Prepare e-commerce portfolio deck focusing on apparel",
        "Assign technical architect for demo call"
      ],
      objections: ["Asked if payment gateway charges are included"],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  call_transcripts: [
    {
      conversation_id: "conv-201",
      speaker: "agent",
      message: "Hello! Welcome to TechNova Solutions. How can I assist with your software project today?",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      sentiment: "Positive"
    },
    {
      conversation_id: "conv-201",
      speaker: "customer",
      message: "Hi, I want to develop an e-commerce website for our clothing brand.",
      timestamp: new Date(Date.now() - 3600000 * 2 + 10000).toISOString(),
      sentiment: "Positive"
    },
    {
      conversation_id: "conv-201",
      speaker: "agent",
      message: "Great! What is your approximate budget for this project?",
      timestamp: new Date(Date.now() - 3600000 * 2 + 20000).toISOString(),
      sentiment: "Neutral"
    },
    {
      conversation_id: "conv-201",
      speaker: "customer",
      message: "Around 50,000 rupees. Can you do that?",
      timestamp: new Date(Date.now() - 3600000 * 2 + 30000).toISOString(),
      sentiment: "Neutral"
    },
    {
      conversation_id: "conv-201",
      speaker: "agent",
      message: "Yes! Our starter e-commerce package is ₹45,000 to ₹60,000, which includes mobile-responsive design, product catalog up to 100 items, and secure payment gateway integration. When would you like to start?",
      timestamp: new Date(Date.now() - 3600000 * 2 + 40000).toISOString(),
      sentiment: "Positive"
    },
    {
      conversation_id: "conv-201",
      speaker: "customer",
      message: "Next month. That sounds perfect.",
      timestamp: new Date(Date.now() - 3600000 * 2 + 50000).toISOString(),
      sentiment: "Positive"
    },
    {
      conversation_id: "conv-201",
      speaker: "agent",
      message: "Thank you, Rahul! I can arrange a free 30-minute consultation with our team. Would you like me to book an appointment?",
      timestamp: new Date(Date.now() - 3600000 * 2 + 60000).toISOString(),
      sentiment: "Positive"
    },
    {
      conversation_id: "conv-201",
      speaker: "customer",
      message: "Yes, please book it.",
      timestamp: new Date(Date.now() - 3600000 * 2 + 70000).toISOString(),
      sentiment: "Positive"
    }
  ],
  appointments: [
    {
      id: "apt-301",
      lead_id: "lead-101",
      title: "TechNova E-Commerce Discovery Call with Rahul Sharma",
      customer_name: "Rahul Sharma",
      customer_email: "rahul.sharma@bizcraft.in",
      scheduled_time: new Date(Date.now() + 86400000 * 2).toISOString(),
      duration_minutes: 30,
      status: "confirmed",
      google_calendar_event_id: "gcal_evt_mock_019283",
      google_meet_link: "https://meet.google.com/tec-nova-demo",
      notes: "Client requires e-commerce store with ₹50,000 budget and Razorpay integration.",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  knowledge_documents: [],
  knowledge_chunks: []
};

class SupabaseService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.client = null;
    this.useSupabase = false;

    if (this.supabaseUrl && this.supabaseKey && !this.supabaseUrl.includes('your-project')) {
      try {
        this.client = createClient(this.supabaseUrl, this.supabaseKey);
        this.useSupabase = true;
        console.log('[SupabaseService] Connected to live Supabase PostgreSQL:', this.supabaseUrl);
      } catch (err) {
        console.warn('[SupabaseService] Failed to initialize Supabase client, falling back to local store:', err.message);
      }
    } else {
      console.log('[SupabaseService] No active Supabase credentials provided; using resilient local storage with seeding.');
    }

    this._initLocalStore();
  }

  _initLocalStore() {
    if (!fs.existsSync(LOCAL_STORE_FILE)) {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(INITIAL_STORE, null, 2));
    }
  }

  _readLocal() {
    try {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return INITIAL_STORE;
    }
  }

  _writeLocal(data) {
    try {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[SupabaseService] Error writing to local store:', err);
    }
  }

  isConfigured() {
    return {
      connected: this.useSupabase,
      type: this.useSupabase ? 'Supabase PostgreSQL (Cloud)' : 'Local Resilient Store (SQLite/JSON)',
      status: this.useSupabase ? 'ACTIVE_ONLINE' : 'ACTIVE_LOCAL'
    };
  }

  // --- LEADS ---
  async getLeads() {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
      console.warn('[SupabaseService] Falling back to local store for getLeads');
    }
    const store = this._readLocal();
    return store.leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getLeadById(id) {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('leads').select('*').eq('id', id).single();
      if (!error && data) return data;
    }
    const store = this._readLocal();
    return store.leads.find(l => l.id === id) || null;
  }

  async createLead(leadData) {
    const newLead = {
      id: leadData.id || `lead-${Date.now()}`,
      name: leadData.name || 'Anonymous Visitor',
      email: leadData.email || null,
      phone: leadData.phone || null,
      requirements: leadData.requirements || 'General sales inquiry',
      budget: leadData.budget || 'Not specified',
      timeline: leadData.timeline || 'Flexible',
      lead_status: leadData.lead_status || 'WARM',
      sentiment: leadData.sentiment || 'Neutral',
      qualification_reason: leadData.qualification_reason || 'Extracted from voice consultation',
      source: leadData.source || 'Voice Agent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.useSupabase) {
      const { data, error } = await this.client.from('leads').insert([newLead]).select();
      if (!error && data && data.length) return data[0];
    }

    const store = this._readLocal();
    store.leads.unshift(newLead);
    this._writeLocal(store);
    return newLead;
  }

  async updateLead(id, updates) {
    const updatedRecord = { ...updates, updated_at: new Date().toISOString() };
    if (this.useSupabase) {
      const { data, error } = await this.client.from('leads').update(updatedRecord).eq('id', id).select();
      if (!error && data && data.length) return data[0];
    }
    const store = this._readLocal();
    const index = store.leads.findIndex(l => l.id === id);
    if (index !== -1) {
      store.leads[index] = { ...store.leads[index], ...updatedRecord };
      this._writeLocal(store);
      return store.leads[index];
    }
    return null;
  }

  // --- CONVERSATIONS ---
  async getConversations() {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('conversations').select('*, leads(*)').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const store = this._readLocal();
    return store.conversations.map(conv => {
      const lead = store.leads.find(l => l.id === conv.lead_id) || null;
      return { ...conv, lead };
    });
  }

  async createConversation(convData) {
    const newConv = {
      id: convData.id || `conv-${Date.now()}`,
      lead_id: convData.lead_id || null,
      call_duration: convData.call_duration || 0,
      status: convData.status || 'completed',
      sentiment: convData.sentiment || 'Neutral',
      sentiment_score: convData.sentiment_score || 0.0,
      summary: convData.summary || '',
      action_items: convData.action_items || [],
      objections: convData.objections || [],
      created_at: new Date().toISOString()
    };

    if (this.useSupabase) {
      const { data, error } = await this.client.from('conversations').insert([newConv]).select();
      if (!error && data && data.length) return data[0];
    }

    const store = this._readLocal();
    store.conversations.unshift(newConv);
    this._writeLocal(store);
    return newConv;
  }

  async addTranscript(transcriptItem) {
    const record = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversation_id: transcriptItem.conversation_id,
      speaker: transcriptItem.speaker,
      message: transcriptItem.message,
      timestamp: transcriptItem.timestamp || new Date().toISOString(),
      sentiment: transcriptItem.sentiment || 'Neutral'
    };

    if (this.useSupabase) {
      await this.client.from('call_transcripts').insert([record]);
    }

    const store = this._readLocal();
    store.call_transcripts.push(record);
    this._writeLocal(store);
    return record;
  }

  async getTranscriptsByConversationId(conversationId) {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('call_transcripts').select('*').eq('conversation_id', conversationId).order('timestamp', { ascending: true });
      if (!error && data) return data;
    }
    const store = this._readLocal();
    return store.call_transcripts.filter(t => t.conversation_id === conversationId);
  }

  // --- APPOINTMENTS ---
  async getAppointments() {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('appointments').select('*').order('scheduled_time', { ascending: true });
      if (!error && data) return data;
    }
    const store = this._readLocal();
    return store.appointments.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
  }

  async createAppointment(aptData) {
    const newApt = {
      id: aptData.id || `apt-${Date.now()}`,
      lead_id: aptData.lead_id || null,
      title: aptData.title || `TechNova Consultation with ${aptData.customer_name}`,
      customer_name: aptData.customer_name,
      customer_email: aptData.customer_email || 'client@example.com',
      scheduled_time: aptData.scheduled_time,
      duration_minutes: aptData.duration_minutes || 30,
      status: aptData.status || 'confirmed',
      google_calendar_event_id: aptData.google_calendar_event_id || `gcal_${Date.now()}`,
      google_meet_link: aptData.google_meet_link || 'https://meet.google.com/tec-nova-call',
      notes: aptData.notes || 'Booked by Autonomous AI Sales Voice Agent',
      created_at: new Date().toISOString()
    };

    if (this.useSupabase) {
      const { data, error } = await this.client.from('appointments').insert([newApt]).select();
      if (!error && data && data.length) return data[0];
    }

    const store = this._readLocal();
    store.appointments.push(newApt);
    this._writeLocal(store);
    return newApt;
  }

  // --- KNOWLEDGE BASE ---
  async getKnowledgeDocuments() {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('knowledge_documents').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const store = this._readLocal();
    return store.knowledge_documents;
  }

  async saveKnowledgeDocument(doc, chunks) {
    const newDoc = {
      id: doc.id || `kdoc-${Date.now()}`,
      title: doc.title,
      category: doc.category || 'General',
      file_type: doc.file_type || 'text',
      file_size: doc.file_size || 0,
      content: doc.content,
      chunk_count: chunks.length,
      created_at: new Date().toISOString()
    };

    const newChunks = chunks.map((c, idx) => ({
      id: `chunk-${Date.now()}-${idx}`,
      document_id: newDoc.id,
      chunk_index: idx,
      content: c.content,
      embedding: c.embedding || null,
      metadata: c.metadata || { title: newDoc.title, category: newDoc.category },
      created_at: new Date().toISOString()
    }));

    if (this.useSupabase) {
      await this.client.from('knowledge_documents').insert([newDoc]);
      if (newChunks.length > 0) {
        await this.client.from('knowledge_chunks').insert(newChunks);
      }
    }

    const store = this._readLocal();
    store.knowledge_documents.unshift(newDoc);
    store.knowledge_chunks.push(...newChunks);
    this._writeLocal(store);
    return { document: newDoc, chunksCount: newChunks.length };
  }

  async getAllChunks() {
    if (this.useSupabase) {
      const { data, error } = await this.client.from('knowledge_chunks').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const store = this._readLocal();
    return store.knowledge_chunks;
  }
}

export const supabaseService = new SupabaseService();
